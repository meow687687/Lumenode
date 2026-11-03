import React from 'react';

interface ComparisonTableProps {
  title?: string;
  headers: string[];
  rows: string[][];
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ title, headers, rows }) => {
  return (
    <div className="my-6 rounded-xl border border-slate-800 bg-[#0A0F1D] overflow-hidden shadow-md">
      {title && (
        <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800">
          <h5 className="font-semibold text-sm text-slate-200">{title}</h5>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-sans">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-900/30 transition">
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className={`px-4 py-3 ${
                      cIdx === 0 ? 'font-mono font-semibold text-blue-300' : 'text-slate-300'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
