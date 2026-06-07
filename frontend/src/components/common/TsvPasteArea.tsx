'use client';

import { useState } from 'react';
import { parseTsvToFormData } from '@/lib/tsv';
import type { EmployeeFormData } from '@/lib/types';

interface Props {
  onParsed: (data: Partial<EmployeeFormData>) => void;
}

export default function TsvPasteArea({ onParsed }: Props) {
  const [text, setText] = useState('');

  const handleApply = () => {
    const result = parseTsvToFormData(text);
    if (Object.keys(result).length > 0) {
      onParsed(result);
      setText('');
    }
  };

  return (
    <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-3">
      <p className="mb-1 text-xs text-gray-500">
        Excelからコピーしたデータをここに貼り付け（タブ区切り・先頭行のみ反映）
      </p>
      <textarea
        className="w-full rounded border border-gray-200 p-2 text-sm font-mono"
        rows={3}
        placeholder="社員番号&#9;氏名（漢字）&#9;氏名（かな）&#9;イニシャル&#9;アルファベット&#9;メール&#9;部署&#9;役職&#9;状態"
        value={text}
        onChange={e => setText(e.target.value)}
        onPaste={e => {
          // ペースト直後に反映
          const pasted = e.clipboardData.getData('text');
          setTimeout(() => {
            const result = parseTsvToFormData(pasted);
            if (Object.keys(result).length > 0) {
              onParsed(result);
              setText('');
            }
          }, 0);
        }}
      />
      <button
        type="button"
        disabled={!text.trim()}
        onClick={handleApply}
        className="mt-1 rounded bg-indigo-600 px-3 py-1 text-sm text-white disabled:opacity-40 hover:bg-indigo-700"
      >
        フォームに反映
      </button>
    </div>
  );
}
