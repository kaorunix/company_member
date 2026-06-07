import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '社員リスト管理',
  description: '社員リスト管理システム',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <h1 className="text-xl font-bold text-indigo-700">社員リスト管理</h1>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
