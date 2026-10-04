"use client";
// First card when the Apprentice button is clicked: what will happen, in plain words,
// before anything starts (the brief's Trust question, answered up front).

import { useState } from "react";
import Popup from "./Popup";

interface Props {
  title: string;
  subtitle: string;
  modeLabel: string;
  taskLabel: string;
  tasks: string[];
  expectations: string[];
  startLabel: string;
  onStart: (task: string) => void;
  onClose: () => void;
}

export default function StartCard({ title, subtitle, modeLabel, taskLabel, tasks, expectations, startLabel, onStart, onClose }: Props) {
  const [task, setTask] = useState(tasks[0]);
  return (
    <Popup title={title} subtitle={subtitle} modeLabel={modeLabel} initial={{ top: 132, right: 150 }} width={430} onClose={onClose}>
      <div className="px-5 pb-1 pt-4">
        <label className="mb-1.5 block text-[12.5px] font-bold uppercase tracking-wide text-[#333]" htmlFor="appr-task">
          {taskLabel}
        </label>
        <select
          id="appr-task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="h-11 w-full rounded-none border border-[#9aa0a6] bg-white px-3 text-[16px] focus:border-indigo focus:outline-none"
        >
          {tasks.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <div className="mb-1 mt-4 text-[12.5px] font-bold uppercase tracking-wide text-[#333]">What to expect</div>
        <ul>
          {expectations.map((x) => (
            <li key={x} className="flex gap-3 border-b border-[#eee] py-2.5 text-[15px] leading-snug last:border-b-0">
              <span className="text-ok">✓</span>
              <span dangerouslySetInnerHTML={{ __html: x }} />
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-2 bg-panel-2 px-5 py-2.5 text-[13.5px] text-[#444]">
        <svg width="14" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
        </svg>
        Uses your microphone so you can answer by talking.
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
        <button className="h-10 rounded-sm border border-indigo bg-white px-4 text-[15px] text-indigo hover:bg-indigo-soft" onClick={onClose}>
          Not now
        </button>
        <button className="h-10 rounded-sm bg-indigo px-4 text-[15px] text-white hover:bg-indigo-dark" onClick={() => onStart(task)}>
          {startLabel}
        </button>
      </div>
    </Popup>
  );
}
