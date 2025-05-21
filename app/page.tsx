import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-6">
      <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-10 max-w-md w-full text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          환영합니다!
        </h1>
        <p className="text-gray-700 mb-6">
          AI 기반 PDF 메모 & 요약 서비스에 오신 것을 환영합니다.
          <br />
          PDF를 업로드하고, 자동 생성되는 요약 청크를 자유롭게 관리해보세요.
        </p>
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          <Link href="/pdf-viewer">📄 PDF 업로드 시작하기</Link>
        </button>
      </div>
      <footer className="mt-10 text-white opacity-80 text-sm">
        © 2025 Your Company. All rights reserved.
      </footer>
    </div>
  )
}
