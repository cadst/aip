import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'PDF RAG Learning',
  description: 'RAG 기반 PDF 시스템',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-100 text-gray-900 min-h-screen">
        <nav className="bg-white shadow-md px-4 py-3 flex gap-6">
          <Link href="/">🏠 홈</Link>
          <Link href="/pdf-viewer">📄 PDF 뷰어</Link>
          <Link href="/settings">⚙️ 설정</Link>
        </nav>
        <main className="p-4">{children}</main>
      </body>
    </html>
  )
}

