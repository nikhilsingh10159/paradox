'use client';

import { useState } from 'react';
import { useAppContext, CreateJobPayload } from '@/context/AppContext';
import { useBlockchainAction } from '@/hooks/useBlockchainAction';

interface PostJobModalProps {
  onClose: () => void;
}

interface MilestoneDraft {
  label: string;
  percent: number;
  requirements: string;
}

const DEFAULT_MILESTONES: MilestoneDraft[] = [
  { label: 'M1', percent: 50, requirements: 'Initial deliverable and scope completion' },
  { label: 'M2', percent: 50, requirements: 'Final delivery and handoff' },
];

export default function PostJobModal({ onClose }: PostJobModalProps) {
  const { createJob } = useAppContext();
  const { execute, isLoading } = useBlockchainAction();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('3000');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [milestones, setMilestones] = useState<MilestoneDraft[]>(DEFAULT_MILESTONES);

  const totalBudget = Number(budget) || 0;
  const percentTotal = milestones.reduce((sum, m) => sum + m.percent, 0);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput('');
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || totalBudget <= 0 || percentTotal !== 100) return;

    const payload: CreateJobPayload = {
      title: title.trim(),
      description: description.trim(),
      requiredSkills: skills,
      freelancerAddress: '0x0000000000000000000000000000000000000000',
      tranches: milestones.map((m) => ({
        amount: Math.round((totalBudget * m.percent) / 100),
        requirements: `${m.label} (${m.percent}%): ${m.requirements}`,
      })),
    };

    execute('post-job', 'Post New Job', () => {
      createJob(payload);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-label="Close modal" />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900">Post New Job</h2>
        <p className="mt-2 text-sm text-slate-500">Define scope, budget, and milestone breakdown for freelancers.</p>

        <div className="mt-6 space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Job Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="DeFi Staking Contract Audit"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe deliverables, timeline, and acceptance criteria..."
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Required Skills</label>
            <div className="mt-2 flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Solidity, Foundry..."
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button type="button" onClick={addSkill} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Budget (Platform Coins)</label>
            <input
              type="number"
              min={1}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Milestone Breakdown</label>
              <span className={`text-xs font-semibold ${percentTotal === 100 ? 'text-emerald-600' : 'text-red-600'}`}>
                {percentTotal}% allocated
              </span>
            </div>
            <div className="mt-2 space-y-3">
              {milestones.map((milestone, index) => (
                <div key={milestone.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={milestone.percent}
                      onChange={(e) => {
                        const next = [...milestones];
                        next[index] = { ...milestone, percent: Number(e.target.value) };
                        setMilestones(next);
                      }}
                      className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-semibold"
                    />
                    <span className="self-center text-xs font-medium text-slate-500">%</span>
                    <input
                      value={milestone.requirements}
                      onChange={(e) => {
                        const next = [...milestones];
                        next[index] = { ...milestone, requirements: e.target.value };
                        setMilestones(next);
                      }}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {milestone.label}: {Math.round((totalBudget * milestone.percent) / 100).toLocaleString()} Coins
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim() || totalBudget <= 0 || percentTotal !== 100 || isLoading('post-job')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading('post-job') && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            Publish Job Listing
          </button>
        </div>
      </div>
    </div>
  );
}
