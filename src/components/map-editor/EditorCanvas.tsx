'use client'
import { useRef, useState, useCallback, useEffect } from 'react'
import { Stage, Layer, Image, Circle, Line } from 'react-konva'
import useImage from 'use-image'
import { calculatePolygonArea } from '@/lib/geometry'
import type { ZoneDraft } from '@/types'

const PIXELS_PER_METER = 10

export default function EditorCanvas({
  imageUrl, zones, setZones, mode, scale
}: {
  imageUrl: string | null
  zones: ZoneDraft[]
  setZones: React.Dispatch<React.SetStateAction<ZoneDraft[]>>
  mode: 'draw' | 'select'
  scale: number
}) {
  const [bgImage] = useImage(imageUrl || '')
  const [currentPoints, setCurrentPoints] = useState<number[][]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [tempName, setTempName] = useState('')
  const stageRef = useRef<any>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && currentPoints.length >= 3) closePolygon()
      if (e.key === 'Escape') setCurrentPoints([])
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentPoints])

  const handleStageClick = useCallback((e: any) => {
    if (mode !== 'draw' || !imageUrl) return
    const stage = stageRef.current
    if (!stage) return
    const pos = stage.getPointerPosition()
    if (!pos) return
    const x = (pos.x - stage.x()) / scale
    const y = (pos.y - stage.y()) / scale
    setCurrentPoints(prev => [...prev, [x, y]])
  }, [mode, imageUrl, scale])

  const closePolygon = useCallback(() => {
    if (currentPoints.length < 3) return
    const id = `draft-${Date.now()}`
    const area = calculatePolygonArea(currentPoints, PIXELS_PER_METER)
    // ✅ ตั้งชื่ออัตโนมัติตามลำดับ + timestamp
    const zoneNumber = zones.length + 1
    const newZone: ZoneDraft = { 
      id, 
      name: `โซน ${String.fromCharCode(64 + zoneNumber)}-${Date.now().toString().slice(-4)}`, 
      points: currentPoints, 
      area 
    }
    setZones(prev => [...prev, newZone])
    setCurrentPoints([])
  }, [currentPoints, zones.length, setZones])

  const deleteZone = (id: string) => {
    setZones(prev => prev.filter(z => z.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const startEditing = (zone: ZoneDraft, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingName(zone.id)
    setTempName(zone.name)
  }

  const saveName = (id: string) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, name: tempName } : z))
    setEditingName(null)
  }

  const flattenPoints = (pts: number[][]) => pts.flat()

  return (
    <div className="flex-1 overflow-hidden bg-slate-100 relative">
      {!imageUrl ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
          <p className="text-lg">📷 อัปโหลดภาพแผนที่โดรนหรือภาพถ่ายแปลง</p>
        </div>
      ) : (
        <Stage ref={stageRef} width={1400} height={900} onClick={handleStageClick}
          scaleX={scale} scaleY={scale} className="bg-white rounded-lg shadow-sm mx-auto my-4">
          <Layer>
            {bgImage && <Image image={bgImage} width={bgImage.width} height={bgImage.height} />}
            
            {zones.map(zone => (
              <Line key={zone.id} points={flattenPoints(zone.points)} closed={true}
                fill={selectedId === zone.id ? '#10b98155' : '#3b82f622'}
                stroke={selectedId === zone.id ? '#059669' : '#2563eb'} strokeWidth={selectedId === zone.id ? 3 : 2}
                onClick={() => mode === 'select' && setSelectedId(zone.id)} />
            ))}
            
            {currentPoints.length > 0 && (
              <>
                <Line points={flattenPoints(currentPoints)} stroke="#ef4444" strokeWidth={2} />
                {currentPoints.map((p, i) => <Circle key={`pt-${i}`} x={p[0]} y={p[1]} radius={5} fill="#ef4444" />)}
              </>
            )}
          </Layer>
        </Stage>
      )}

      {imageUrl && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-lg border w-72 max-h-[80vh] overflow-y-auto">
          <h3 className="font-semibold mb-3 text-sm">📝 เครื่องมือวาด</h3>
          
          <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-sm font-medium mb-2">📍 จุดปัจจุบัน: <span className="text-emerald-600 font-bold">{currentPoints.length}</span></p>
            <button
              onClick={closePolygon}
              disabled={currentPoints.length < 3}
              className={`w-full py-2 rounded-lg text-sm font-medium transition ${
                currentPoints.length >= 3
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              🔚 ปิดรูปทรงปัจจุบัน {currentPoints.length >= 3 ? '(Enter)' : '(ต้องมี ≥ 3 จุด)'}
            </button>
          </div>

          {zones.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">โซนที่วาดแล้ว ({zones.length})</h4>
              <div className="space-y-2">
                {zones.map(z => (
                  <div key={z.id} className={`p-2 rounded-lg transition ${selectedId === z.id ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 hover:bg-slate-100'}`}
                    onClick={() => mode === 'select' && setSelectedId(z.id)}>
                    <div className="flex justify-between items-center gap-2">
                      {editingName === z.id ? (
                        <input
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          onBlur={() => saveName(z.id)}
                          onKeyDown={(e) => e.key === 'Enter' && saveName(z.id)}
                          className="flex-1 text-sm px-1 py-0.5 border rounded"
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm font-medium flex-1 truncate">{z.name}</p>
                      )}
                      <button 
                        onClick={(e) => startEditing(z, e)} 
                        className="text-xs text-blue-500 hover:text-blue-700 px-1"
                        title="แก้ไขชื่อ"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteZone(z.id); }} 
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">📐 ~{z.area.toLocaleString()} ตร.ม.</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
