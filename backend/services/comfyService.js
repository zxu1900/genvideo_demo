const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const workflowTemplatePath = path.join(__dirname, '../comfy/workflowTemplate.json');
const workflowTemplate = JSON.parse(fs.readFileSync(workflowTemplatePath, 'utf-8'));

const COMFY_BASE_URL = (process.env.COMFYUI_BASE_URL || 'http://117.50.193.105:8188').replace(/\/$/, '');
console.log(`[ComfyService] COMFY_BASE_URL resolved to: ${COMFY_BASE_URL}`);
const COMFY_MODEL = process.env.COMFYUI_MODEL || 'sd15.safetensors';
const COMFY_POSITIVE_PROMPT_PREFIX = process.env.COMFYUI_POSITIVE_PROMPT_PREFIX || 'Children book illustration, bright colors, friendly characters,';
const COMFY_NEGATIVE_PROMPT = process.env.COMFYUI_NEGATIVE_PROMPT || 'low quality, blurry, distorted, nsfw, text';
const COMFY_IMAGE_WIDTH = parseInt(process.env.COMFYUI_IMAGE_WIDTH || '960', 10);
const COMFY_IMAGE_HEIGHT = parseInt(process.env.COMFYUI_IMAGE_HEIGHT || '540', 10);
const COMFY_SAMPLER = process.env.COMFYUI_SAMPLER || 'dpmpp_2m';
const COMFY_SCHEDULER = process.env.COMFYUI_SCHEDULER || 'normal';
const COMFY_STEPS = parseInt(process.env.COMFYUI_STEPS || '24', 10);
const COMFY_CFG = parseFloat(process.env.COMFYUI_CFG || '7.0');
const COMFY_TIMEOUT_MS = parseInt(process.env.COMFYUI_TIMEOUT_MS || '300000', 10);
const COMFY_POLL_INTERVAL_MS = parseInt(process.env.COMFYUI_POLL_INTERVAL_MS || '2000', 10);
const COMFY_REQUEST_TIMEOUT_MS = parseInt(process.env.COMFYUI_REQUEST_TIMEOUT_MS || '20000', 10);
const COMFY_SUBMIT_RETRY = parseInt(process.env.COMFYUI_SUBMIT_RETRY || '3', 10);
const COMFY_SUBMIT_RETRY_DELAY_MS = parseInt(process.env.COMFYUI_SUBMIT_RETRY_DELAY_MS || '2000', 10);
const IMAGE_JOB_TTL_MS = parseInt(process.env.COMFYUI_JOB_TTL_MS || '3600000', 10); // default 1 hour
const IMAGE_JOB_CLEANUP_INTERVAL_MS = parseInt(process.env.COMFYUI_JOB_CLEANUP_INTERVAL_MS || '600000', 10); // default 10 minutes

const imageJobs = new Map();

function cloneWorkflow() {
  return JSON.parse(JSON.stringify(workflowTemplate));
}

function createWorkflowPayload(promptText, seed, filenamePrefix) {
  const workflow = cloneWorkflow();

  workflow.prompt['4'].inputs.ckpt_name = COMFY_MODEL;
  workflow.prompt['6'].inputs.text = `${COMFY_POSITIVE_PROMPT_PREFIX} ${promptText}`.trim();
  workflow.prompt['7'].inputs.text = COMFY_NEGATIVE_PROMPT;

  workflow.prompt['3'].inputs.seed = seed;
  workflow.prompt['3'].inputs.steps = COMFY_STEPS;
  workflow.prompt['3'].inputs.cfg = COMFY_CFG;
  workflow.prompt['3'].inputs.sampler_name = COMFY_SAMPLER;
  workflow.prompt['3'].inputs.scheduler = COMFY_SCHEDULER;

  workflow.prompt['5'].inputs.width = COMFY_IMAGE_WIDTH;
  workflow.prompt['5'].inputs.height = COMFY_IMAGE_HEIGHT;

  workflow.prompt['9'].inputs.filename_prefix = filenamePrefix;

  return workflow;
}

async function submitComfyPrompt(promptText) {
  const clientId = uuidv4();
  const seed = Math.floor(Math.random() * 1_000_000_000);
  const filenamePrefix = `story_scene_${Date.now()}_${seed}`;
  const workflowPayload = createWorkflowPayload(promptText, seed, filenamePrefix);

  const payload = {
    client_id: clientId,
    prompt: workflowPayload.prompt,
  };

  console.log('📨 ComfyUI payload (trimmed):', JSON.stringify(payload).slice(0, 200) + '...');

  let attempts = 0;
  while (attempts < COMFY_SUBMIT_RETRY) {
    attempts += 1;
    try {
      const response = await axios.post(`${COMFY_BASE_URL}/prompt`, payload, {
        timeout: COMFY_REQUEST_TIMEOUT_MS,
      });

      return {
        clientId,
        promptId: response.data.prompt_id,
        filenamePrefix,
      };
    } catch (error) {
      if (error.response) {
        console.error(`ComfyUI /prompt error (attempt ${attempts}):`, error.response.status, JSON.stringify(error.response.data, null, 2));
      } else {
        console.error(`ComfyUI /prompt error (attempt ${attempts}, no response):`, error.message);
      }

      if (attempts >= COMFY_SUBMIT_RETRY) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, COMFY_SUBMIT_RETRY_DELAY_MS * attempts));
    }
  }
}

async function waitForComfyResult(promptId) {
  const start = Date.now();

  while (Date.now() - start < COMFY_TIMEOUT_MS) {
    await new Promise((resolve) => setTimeout(resolve, COMFY_POLL_INTERVAL_MS));

    const historyResponse = await axios.get(`${COMFY_BASE_URL}/history/${promptId}`, {
      timeout: COMFY_REQUEST_TIMEOUT_MS,
    });

    const history = historyResponse.data[promptId];
    if (!history || !history.outputs) {
      continue;
    }

    const outputs = Object.values(history.outputs);
    for (const output of outputs) {
      if (output.images && output.images.length > 0) {
        const imageInfo = output.images[0];
        const imageUrl = `${COMFY_BASE_URL}/view?filename=${encodeURIComponent(imageInfo.filename)}&subfolder=${encodeURIComponent(imageInfo.subfolder || '')}&type=${encodeURIComponent(imageInfo.type || 'output')}`;

        return {
          imageUrl,
          imageInfo,
        };
      }
    }
  }

  throw new Error(`ComfyUI job ${promptId} timed out`);
}

function createJobSnapshot(job) {
  return {
    id: job.id,
    status: job.status,
    scenes: job.scenes.map((scene) => ({ ...scene })),
    completedScenes: job.completedScenes,
    totalScenes: job.totalScenes,
    errors: job.errors.map((err) => ({ ...err })),
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    updatedAt: job.updatedAt,
    lastError: job.lastError || null,
  };
}

function scheduleImageGeneration(jobId) {
  setTimeout(() => {
    runImageGenerationJob(jobId).catch((error) => {
      console.error(`❌ Image job ${jobId} failed:`, error.message);
      const job = imageJobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.lastError = error.message;
        job.errors.push({
          sceneId: null,
          message: error.message,
          occurredAt: new Date().toISOString(),
        });
        job.completedAt = new Date().toISOString();
        job.updatedAt = job.completedAt;
      }
    });
  }, 0);
}

async function runImageGenerationJob(jobId) {
  const job = imageJobs.get(jobId);
  if (!job) {
    return;
  }

  job.status = 'running';
  job.startedAt = new Date().toISOString();
  job.updatedAt = job.startedAt;

  for (let index = 0; index < job.scenes.length; index += 1) {
    const scene = job.scenes[index];
    const sceneLabel = scene.id ?? index + 1;

    try {
      console.log(`🎬 [Job ${jobId}] Sending scene ${sceneLabel} prompt to ComfyUI`);
      const { promptId } = await submitComfyPrompt(scene.imagePrompt || scene.story || '');
      const result = await waitForComfyResult(promptId);

      scene.imageUrl = result.imageUrl;
      scene.comfyImage = result.imageInfo;
      scene.imageError = null;

      console.log(`✅ [Job ${jobId}] Scene ${sceneLabel} image ready: ${result.imageUrl}`);
    } catch (error) {
      console.error(`❌ [Job ${jobId}] ComfyUI error for scene ${sceneLabel}:`, error.message);
      scene.imageUrl = null;
      scene.imageError = error.message;
      job.errors.push({
        sceneId: sceneLabel,
        message: error.message,
        occurredAt: new Date().toISOString(),
      });
      job.lastError = error.message;
    }

    job.completedScenes = index + 1;
    job.updatedAt = new Date().toISOString();
  }

  job.status = job.errors.length > 0 ? 'completed_with_errors' : 'completed';
  job.completedAt = new Date().toISOString();
  job.updatedAt = job.completedAt;
}

function createImageGenerationJob(scenes = []) {
  if (!Array.isArray(scenes) || scenes.length === 0) {
    return { jobId: null, job: null };
  }

  const jobId = uuidv4();
  const nowIso = new Date().toISOString();

  const job = {
    id: jobId,
    status: 'queued',
    scenes: scenes.map((scene) => ({
      ...scene,
      imageUrl: scene.imageUrl || null,
      imageError: scene.imageError || null,
    })),
    createdAt: nowIso,
    startedAt: null,
    completedAt: null,
    updatedAt: nowIso,
    completedScenes: 0,
    totalScenes: scenes.length,
    errors: [],
    lastError: null,
  };

  imageJobs.set(jobId, job);
  scheduleImageGeneration(jobId);

  return { jobId, job: createJobSnapshot(job) };
}

function getImageJob(jobId) {
  if (!jobId || !imageJobs.has(jobId)) {
    return null;
  }

  return createJobSnapshot(imageJobs.get(jobId));
}

function pruneStaleJobs() {
  if (!IMAGE_JOB_TTL_MS) {
    return;
  }

  const now = Date.now();

  for (const [jobId, job] of imageJobs.entries()) {
    const lastTouched = new Date(job.updatedAt || job.createdAt).getTime();
    if (Number.isFinite(lastTouched) && now - lastTouched > IMAGE_JOB_TTL_MS) {
      imageJobs.delete(jobId);
    }
  }
}

if (IMAGE_JOB_CLEANUP_INTERVAL_MS > 0) {
  const cleanupTimer = setInterval(pruneStaleJobs, IMAGE_JOB_CLEANUP_INTERVAL_MS);
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

module.exports = {
  createImageGenerationJob,
  getImageJob,
};

