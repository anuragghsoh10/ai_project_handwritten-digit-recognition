
import React from 'react';

interface ReportSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const ReportSection: React.FC<ReportSectionProps> = ({ title, icon, children }) => {
  return (
    <section className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg p-6 md:p-8">
      <div className="flex items-center mb-4">
        <div className="text-cyan-400 mr-4">{React.cloneElement(icon as React.ReactElement, { className: 'w-8 h-8' })}</div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
      </div>
      <div className="prose prose-invert max-w-none text-slate-300">
        {children}
      </div>
    </section>
  );
};
