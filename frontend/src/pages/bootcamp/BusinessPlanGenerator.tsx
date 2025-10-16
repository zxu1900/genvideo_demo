import React from 'react';
import { Download, Share2, Save } from 'lucide-react';

const BusinessPlanGenerator: React.FC = () => {
  const sections = ['Executive Summary', 'Problem & Solution', 'Market Analysis', 'Product/Service', 'Marketing Strategy', 'Financial Projections', 'Team'];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Business Plan</h1>
          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
            <button className="btn-secondary flex items-center gap-2"><Download className="w-4 h-4" /> Export PDF</button>
            <button className="btn-primary flex items-center gap-2"><Share2 className="w-4 h-4" /> Share</button>
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-1 card">
            <h3 className="font-bold mb-4">Outline</h3>
            <ul className="space-y-2">
              {sections.map((section, i) => (
                <li key={i} className="text-sm hover:text-primary-600 cursor-pointer">{i + 1}. {section}</li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3 card">
            <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
            <textarea className="w-full h-96 p-4 border rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Write or let AI generate your executive summary..." />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPlanGenerator;
