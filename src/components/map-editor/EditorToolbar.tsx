'use client'
import { Upload, Save, Trash2, ZoomIn, ZoomOut, Pen, MousePointer } from 'lucide-react'

export default function EditorToolbar({
  onUpload, onSave, onDelete, mode, setMode, scale, setScale
}: {
  onUpload: (f: File) => void
  onSave: () => void
  onDelete: () => void
  mode: 'draw' | 'select'
  setMode: (m: 'draw' | 'select') => void
  scale: number
  setScale: (s: number) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white border-b border-slate-200 shadow-sm">
      <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer text-sm font-medium transition">
        <Upload size={16} /> อัปโหลดภาพแผนที่
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
      </label>
      
      <div className="flex bg-slate-100 rounded-lg p-1">
        <button onClick={() => setMode('draw')} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${mode === 'draw' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-600'}`}>
          <Pen size={14} /> วาดโซน
        </button>
        <button onClick={() => setMode('select')} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${mode === 'select' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-600'}`}>
          <MousePointer size={14} /> เลือก/ลบ
        </button>
      </div>

      <div className="flex items-center gap-2 border-l border-slate-200 pl-3 ml-2">
        {/* ✅ แก้ไข: คำนวณค่าใหม่โดยตรง แทนการส่งฟังก์ชัน */}
        <button onClick={() => setScale(Math.max(0.5, scale - 0.1))} className="p-2 hover:bg-slate-100 rounded">
          <ZoomOut size={16} />
        </button>
        <span className="text-sm w-12 text-center font-medium">{(scale * 100).toFixed(0)}%</span>
        <button onClick={() => setScale(Math.min(3, scale + 0.1))} className="p-2 hover:bg-slate-100 rounded">
          <ZoomIn size={16} />
        </button>
      </div>

      <div className="ml-auto flex gap-2">
        <button onClick={onDelete} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium flex items-center gap-2 transition">
          <Trash2 size={16} /> ล้างทั้งหมด
        </button>
        <button onClick={onSave} className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-medium flex items-center gap-2 transition">
          <Save size={16} /> บันทึกสู่ DB
        </button>
      </div>
    </div>
  )
}
