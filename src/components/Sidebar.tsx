'use client'
import type { Zone } from '@/types'

export default function Sidebar({ zones, selectedId, onSelect }: { zones: Zone[]; selectedId?: string; onSelect: (z: Zone) => void }) {
  if (zones.length === 0) {
    return (
      <aside className="w-64 bg-white border-r border-slate-200 p-5">
        <h1 className="text-xl font-bold text-emerald-700 mb-6">🌱 ฟาร์มอัจฉริยะ</h1>
        <p className="text-sm text-slate-500">ยังไม่มีโซน กดไปที่ /editor เพื่อวาดแผนผัง</p>
        <a href="/editor" className="mt-4 block w-full text-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition">
          ✏️ ไปหน้าวาดแผนผัง
        </a>
      </aside>
    )
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col">
      <h1 className="text-xl font-bold text-emerald-700 mb-6">🌱 ฟาร์มอัจฉริยะ</h1>
      <nav className="space-y-2 flex-1 overflow-y-auto">
        {zones.map(z => (
          <button
            key={z.id}
            onClick={() => onSelect(z)}
            className={`w-full text-left px-3 py-2 rounded-lg transition ${
              selectedId === z.id ? 'bg-emerald-100 text-emerald-800 font-medium' : 'hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>📍 {z.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                z.status === 'ปกติ' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>{z.status}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{z.crop_type || 'ไม่ระบุ'} | {z.area_sqm?.toLocaleString()} ตร.ม.</p>
          </button>
        ))}
      </nav>
      <div className="mt-4 pt-4 border-t border-slate-200">
        <a href="/editor" className="block w-full text-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition">
          ✏️ ไปหน้าวาดแผนผัง
        </a>
      </div>
    </aside>
  )
}
