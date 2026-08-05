import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { AIService } from '../../services/ai/AIService';
import { AIModel } from '../../types/ai';
import { ChevronDown, Cpu, Sparkles, Check } from 'lucide-react';

export const ModelSelector: React.FC = () => {
  const { activeModelId, setActiveModel, activeProviderId, setActiveProvider } = useSettingsStore();
  const [models, setModels] = useState<AIModel[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    AIService.getInstance()
      .getAllModels()
      .then((res) => setModels(res));
  }, []);

  const activeModel = models.find((m) => m.id === activeModelId) || models[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-background-cardDark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs text-text-primaryLight dark:text-text-primaryDark font-medium shadow-soft"
      >
        {activeModel?.isLocal ? (
          <Cpu size={14} className="text-emerald-500" />
        ) : (
          <Sparkles size={14} className="text-blue-500" />
        )}
        <span>{activeModel?.name || 'Select Model'}</span>
        <ChevronDown size={13} className="text-text-secondaryLight dark:text-text-secondaryDark" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-1.5 w-64 z-50 p-1.5 bg-white dark:bg-background-cardDark border border-border-light dark:border-border-dark rounded-2xl shadow-float space-y-1">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondaryLight dark:text-text-secondaryDark">
              Available Models
            </div>
            {models.map((m) => {
              const isSelected = m.id === activeModelId;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveModel(m.id);
                    setActiveProvider(m.providerId);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl transition-colors flex items-start justify-between ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-text-primaryLight dark:text-text-primaryDark'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <span>{m.name}</span>
                      {m.isLocal && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          Local
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-text-secondaryLight dark:text-text-secondaryDark line-clamp-1">
                      {m.description}
                    </div>
                  </div>
                  {isSelected && <Check size={14} className="mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
