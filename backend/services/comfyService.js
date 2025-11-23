const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 使用 Flux workflow
const fluxWorkflowPath = path.join(__dirname, '../comfy/flux_dev_full_text_to_image.json');
const fluxWorkflowTemplate = JSON.parse(fs.readFileSync(fluxWorkflowPath, 'utf-8'));

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
  return JSON.parse(JSON.stringify(fluxWorkflowTemplate));
}

/**
 * 创建 Flux workflow payload
 * @param {string} imagePrompt - CLIP-L 主要描述（简洁）
 * @param {string} imagePromptDetailed - T5-XXL 详细描述（可选）
 * @param {number} seed - 随机种子
 * @param {string} filenamePrefix - 文件名前缀
 */
function createWorkflowPayload(imagePrompt, imagePromptDetailed = '', seed, filenamePrefix) {
  const workflow = cloneWorkflow();

  // 节点 41: CLIPTextEncodeFlux - 设置双 CLIP prompt
  workflow['41'].inputs.clip_l = imagePrompt || 'A vibrant children\'s book illustration in a modern cartoon style.';
  workflow['41'].inputs.t5xxl = imagePromptDetailed || '';
  workflow['41'].inputs.guidance = parseFloat(process.env.FLUX_GUIDANCE || '3.5');

  // 节点 31: KSampler - 设置采样参数
  workflow['31'].inputs.seed = seed;
  workflow['31'].inputs.steps = COMFY_STEPS;
  workflow['31'].inputs.cfg = COMFY_CFG;
  workflow['31'].inputs.sampler_name = COMFY_SAMPLER;
  workflow['31'].inputs.scheduler = COMFY_SCHEDULER;

  // 节点 27: EmptySD3LatentImage - 设置图像尺寸
  workflow['27'].inputs.width = COMFY_IMAGE_WIDTH;
  workflow['27'].inputs.height = COMFY_IMAGE_HEIGHT;

  // 节点 9: SaveImage - 设置文件名前缀
  workflow['9'].inputs.filename_prefix = filenamePrefix;

  return workflow;
}

/**
 * 提交 ComfyUI prompt（支持 Flux 双 CLIP）
 * @param {string|object} promptInput - 如果是字符串，使用旧格式；如果是对象，包含 imagePrompt 和 imagePromptDetailed
 */
async function submitComfyPrompt(promptInput) {
  const clientId = uuidv4();
  const seed = Math.floor(Math.random() * 1_000_000_000);
  const filenamePrefix = `story_scene_${Date.now()}_${seed}`;
  
  // 兼容旧格式（字符串）和新格式（对象）
  let imagePrompt, imagePromptDetailed;
  if (typeof promptInput === 'string') {
    // 旧格式：单个 prompt
    imagePrompt = promptInput;
    imagePromptDetailed = '';
  } else if (promptInput && typeof promptInput === 'object') {
    // 新格式：双 prompt
    imagePrompt = promptInput.imagePrompt || promptInput.prompt || '';
    imagePromptDetailed = promptInput.imagePromptDetailed || '';
  } else {
    throw new Error('Invalid prompt input format');
  }
  
  const workflowPayload = createWorkflowPayload(imagePrompt, imagePromptDetailed, seed, filenamePrefix);

  const payload = {
    client_id: clientId,
    prompt: workflowPayload,
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

    // ComfyUI history API 返回所有历史记录，需要从中查找对应的 promptId
    const historyResponse = await axios.get(`${COMFY_BASE_URL}/history`, {
      timeout: COMFY_REQUEST_TIMEOUT_MS,
    });

    // historyResponse.data 格式: { [prompt_id]: { ... } }
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
      
      // 使用 Flux 双 CLIP prompt
      const promptInput = {
        imagePrompt: scene.imagePrompt || scene.story || '',
        imagePromptDetailed: scene.imagePromptDetailed || ''
      };
      
      console.log(`📝 [Job ${jobId}] Scene ${sceneLabel} prompts:`, {
        clip_l: promptInput.imagePrompt.substring(0, 50) + '...',
        t5xxl: promptInput.imagePromptDetailed ? promptInput.imagePromptDetailed.substring(0, 50) + '...' : '(empty)'
      });
      
      const { promptId } = await submitComfyPrompt(promptInput);
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

