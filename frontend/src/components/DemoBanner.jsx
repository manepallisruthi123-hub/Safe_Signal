import React, { useState } from "react";
import { Info, RotateCcw, X, ShieldCheck } from "lucide-react";
import { storage } from "../services/storage";

export function DemoBanner({ onReset }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-lavender-50 border-b border-lavender-200 px-4 py-2 text-xs text-plum-950 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center space-x-2">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-plum-700 text-white tracking-wide">
          recHERsion'26 Demo
        </span>
        <span className="font-medium text-slate-700">
          SafeSignal is running in privacy-conscious Hackathon Demo Mode. Prototype data is stored locally in your browser.
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center space-x-1 font-semibold text-plum-700 hover:text-plum-950 underline hover:no-underline"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Demo Data</span>
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-600 p-0.5"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
