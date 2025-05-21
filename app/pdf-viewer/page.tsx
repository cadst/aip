import PDFChunkViewer from '@/components/PDFOverlayViewer'
import SmartPDFMemoBoard from '@/components/SmartPDFMemoBoard'

export default function PDFViewerPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">📄 PDF 청크 뷰어</h1>
      <SmartPDFMemoBoard />
    </div>
  )
}
