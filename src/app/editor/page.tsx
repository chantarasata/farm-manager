'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import EditorToolbar from '@/components/map-editor/EditorToolbar'
import EditorCanvas from '@/components/map-editor/EditorCanvas'
import { supabase } from '@/lib/supabase'
import type { ZoneDraft } from '@/types'

export default function EditorPage() {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [zones, setZones] = useState<ZoneDraft[]>([])
  const [mode, setMode] = useState<'draw' | 'select'>('draw')
  const [scale, setScale] = useState(1)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleUpload = useCallback((file: File) => {
    // ✅ แสดงภาพชั่วคราวในหน้า Editor เท่านั้น
    setImageUrl(URL.createObjectURL(file))
    setMessage(null)
    setZones([])
  }, [])

  const handleSave = async () => {
    if (zones.length === 0) {
      setMessage({ type: 'error', text: '⚠️ ยังไม่มีโซน ให้กดปุ่ม "ปิดรูปทรงปัจจุบัน" ก่อน' })
      return
    }

    setSaving(true)
    setMessage(null)
    
    try {
      // ✅ บันทึกเฉพาะข้อมูลโซน (ไม่อัปโหลดภาพ)
      const payload = zones.map(z => ({
        name: z.name,
        crop_type: 'ยังไม่ระบุ',
        coordinates: z.points,
        area_sqm: z.area,
        status: 'ปกติ',
        map_url: null // ✅ ไม่บันทึกภาพตอนนี้
      }))

      console.log('📤 Sending:', payload)
      
      const { data, error } = await supabase
        .from('zones')
        .insert(payload)
        .select()
      
      if (error) {
        console.error('Supabase Error:', error)
        throw error
      }

      console.log('✅ Success:', data)
      setMessage({ type: 'success', text: `✅ บันทึก ${zones.length} โซน สำเร็จ!` })
      setZones([])
      
      setTimeout(() => {
        router.refresh()
        router.push('/')
      }, 1500)
      
    } catch (err: any) {
      console.error('Error:', err)
      setMessage({ 
        type: 'error', 
        text: `❌ บันทึกไม่สำเร็จ: ${err.message || 'เกิดข้อผิดพลาด'}` 
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <EditorToolbar
        onUpload={handleUpload} onSave={handleSave} onDelete={() => setZones([])}
        mode={mode} setMode={setMode} scale={scale} setScale={setScale}
      />
      
      {message && (
        <div className={`p-4 text-center font-medium border-b ${
          message.type === 'success' 
            ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
            : 'bg-red-100 text-red-700 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <EditorCanvas
        imageUrl={imageUrl} zones={zones} setZones={setZones} mode={mode} scale={scale}
      />

      {saving && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl text-center">
            <p className="text-lg font-semibold text-emerald-700 mb-2">⏳ กำลังบันทึกข้อมูลโซน...</p>
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  )
}
