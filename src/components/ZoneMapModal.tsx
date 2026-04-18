'use client'
import { useRef, useState } from 'react'
import { Stage, Layer, Line, Image } from 'react-konva'
import useImage from 'use-image'
import { X, ZoomIn, ZoomOut } from 'lucide-react'

export default function ZoneMapModal({ 
  zone, 
  onClose 
}: { 
  zone: any
  onClose: () => void
}) {
  const [scale, setScale] = useState(1)
  // ✅ ใช้ map_url จาก zone (ถ้ามี) หรือใช้ default
  const [mapImage] = useImage(zone.map_url || '/default-map.jpg')

  const flattenPoints = (pts: number[][]) => pts.flat()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-slate-800">🗺️ แผนที่: {zone.name}</h2>
            <p className="text-sm text-slate-500">พื้นที่: {zone.area_sqm?.toLocaleString()} ตร.ม.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 bg-slate-100">
          <div className="flex gap-2 mb-3">
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="px-3 py-1 bg-white rounded shadow">
              <ZoomOut size={16} />
            </button>
            <span className="px-3 py-1 bg-white rounded shadow">{(scale * 100).toFixed(0)}%</span>
            <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="px-3 py-1 bg-white rounded shadow">
              <ZoomIn size={16} />
            </button>
          </div>

          <div className="bg-white rounded-lg overflow-hidden border">
            <Stage width={900} height={600} scaleX={scale} scaleY={scale}>
              <Layer>
                {mapImage && <Image image={mapImage} width={900} height={600} />}
                <Line 
                  points={flattenPoints(zone.coordinates)} 
                  closed={true}
                  fill="#10b98155"
                  stroke="#059669"
                  strokeWidth={3}
                />
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  )
}
