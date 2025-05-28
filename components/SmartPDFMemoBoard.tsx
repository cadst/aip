'use client'

import { useState, useEffect, useRef } from 'react'
import { Rnd } from 'react-rnd'
import { Document, Page, pdfjs } from 'react-pdf'
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
} from 'reactflow'
import 'reactflow/dist/style.css'
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js'

type Chunk = {
  id: string
  x: number
  y: number
  width: number
  height: number
  text: string
  group?: string
  color: string
  references: {
    page: number
    x: number
    y: number
    width: number
    height: number
  }
}


export default function SmartPDFMemoBoard() {
  const [file, setFile] = useState<File | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [chunks, setChunks] = useState<Chunk[]>([])
  const [query, setQuery] = useState<string>("")

  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  // ✅ 청크를 ReactFlow 노드로 매핑
  const nodes: Node[] = chunks.map(chunk => ({
    id: chunk.id,
    type: 'default',
    data: {
    label: (
      <div className="w-full h-full relative">
        <button
          onClick={() => handleDeleteChunk(chunk.id)}
          className="absolute top-1 right-1 text-xs bg-red-500 text-white px-1 rounded"
        >
          ✕
        </button>
        <pre className="whitespace-pre-wrap">{chunk.text}</pre>
      </div>
    ),
    references: {
      page: chunk.references.page,
      x: chunk.references.x,
      y: chunk.references.y,
      width: chunk.references.width,
      height: chunk.references.height
    }
  },
    position: { x: chunk.x, y: chunk.y },
    style: {
      width: chunk.width,
      height: chunk.height,
      background: chunk.color || '#fefcbf',
      border: '1px solid #ecc94b',
      padding: 10,
      fontSize: 12,
      overflow: 'auto',
    },
  }))


  const extractTextFromPdf = async (pdfUrl: string): Promise<string[]> => {
  const loadingTask = pdfjs.getDocument(pdfUrl)
  const pdf = await loadingTask.promise

  const texts: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => ('str' in item ? item.str : '')).join(' ')
    texts.push(pageText)
  }

  return texts // 페이지별 텍스트 배열 반환
}
  const handleDeleteChunk = (id: string) => {
  setChunks(prev => prev.filter(chunk => chunk.id !== id))
  setSelectedNode(prevSelected => {
    if (prevSelected?.id === id) return null
    return prevSelected
  })
  setEdges(prev => prev.filter(edge => edge.source !== id && edge.target !== id))
}

  const getRandomColor = () => {
  const colors = ['#fefcbf', '#c6f6d5', '#bee3f8', '#fbd38d', '#fed7e2', '#e9d8fd']
  return colors[Math.floor(Math.random() * colors.length)]
}

  const onNodesChange = (changes: any) => {
    // 노드 위치 변경 시 chunks 상태도 동기화
    changes.forEach((change: any) => {
      if (change.type === 'position' && change.position) {
        setChunks(prev =>
          prev.map(chunk =>
            chunk.id === change.id
              ? { ...chunk, x: change.position.x, y: change.position.y }
              : chunk
          )
        )
      }
    })
  }

  const onConnect = (params: Edge | Connection) => setEdges(eds => addEdge(params, eds))
  const onEdgeClick = (_: any, edge: Edge) => setEdges(eds => eds.filter(e => e.id !== edge.id))
  const onNodeClick = (_: any, node: Node) => {
    console.log(node)
    const select = nodes.find(n => n.id === node.id)
    if (select){
      setSelectedNode(select);
    } else {
      setSelectedNode(null);
    }
    setPageNumber(node.data.references.page)
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile){
      setFile(selectedFile)
      } 
   }

  const generateLLMResponse = async (query: string): Promise<string> => {
    return `LLM 응답 (예시): "${query}"에 대한 답변입니다.`
  }

  const createQueryResponseChunk = async () => {
    if (!query.trim()) return
    const response = await generateLLMResponse(query)
    const combinedText = `사용자 질문:\n${query}\n\nAI 응답:\n${response}`
    const newChunk: Chunk = {
      id: crypto.randomUUID(),
      x: 50 + chunks.length * 30,
      y: 50 + chunks.length * 30,
      width: 260,
      height: 140,
      text: combinedText,
      color: getRandomColor(),
      references: {
        page: pageNumber,
        x: 50 + chunks.length * 30,
      y: 50 + chunks.length * 30,
      width: 260,
      height: 140,
      }
    }
    setChunks(prev => [...prev, newChunk])
    setQuery("")
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => setNumPages(numPages)

  return (
    <div className="p-4 space-y-4">
      <input type="file" accept="application/pdf" onChange={handleFileChange} />

      <div className="flex gap-4">
        <div className="border w-[700px] h-[800px] relative bg-white overflow-auto">
          {file && (
            <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={pageNumber} renderAnnotationLayer={false} />
              {selectedNode && selectedNode.data.references.page === pageNumber ? (
                <div 
                  key={selectedNode.id}
                  style={{
                    position: 'absolute',
                    top: selectedNode.data.references.y,
                    left: selectedNode.data.references.x,
                    width: selectedNode.data.references.width,
                    height: selectedNode.data.references.height,
                    backgroundColor: 'rgba(255,255,0,0.4)',
                  }}
                />
              ) : <div />}
            </Document>
          )}
          <div className="sticky bottom-2 left-2 bg-white p-1 rounded shadow">
            <button
              onClick={() => setPageNumber((p) => Math.max(p - 1, 1))
              }
              disabled={pageNumber <= 1}
              className="px-2"
            >
              ◀
            </button>
            <span className="mx-2">페이지 {pageNumber} / {numPages}</span>
            <button
              onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))}
              disabled={pageNumber >= numPages}
              className="px-2"
            >
              ▶
            </button>
          </div>
        </div>

        <div className="w-[800px] h-[800px] border overflow-auto">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              fitView
            >
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      <div className="flex items-center p-2 border-t bg-white">
        <textarea
          placeholder="질문을 입력하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-1-md"
        />
        <button
          onClick={createQueryResponseChunk}
          className="px-3 py-2 bg-black text-white rounded"
        >
          ↑
        </button>
      </div>
    </div>
  )
}
