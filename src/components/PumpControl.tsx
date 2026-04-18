'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Power, RefreshCw, AlertTriangle } from 'lucide-react'

export default function PumpControl({ 
  zoneId, 
  deviceId 
}: { 
  zoneId: string
  deviceId: string  // เช่น "esp32-pump-zone-a"
}) {
  const [device, setDevice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState<number>(0)

  // ✅ ดึงข้อมูลอุปกรณ์ + Subscribe Realtime
  useEffect(() => {
    async function fetchDevice() {
      const { data } = await supabase
        .from('devices')
        .select('*')
        .eq('device_id', deviceId)
        .single()
      
      if (data) setDevice(data)
      setLoading(false)
    }
    fetchDevice()

    // ✅ Realtime: อัปเดตทันทีเมื่ออุปกรณ์ออนไลน์/ออฟไลน์
    const channel = supabase
      .channel(`device-${deviceId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'devices',
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          console.log('📡 Device status updated:', payload.new)
          setDevice(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [deviceId])

  // ✅ ส่งคำสั่งควบคุม
  const sendCommand = async (command: 'turn_on' | 'turn_off' | 'toggle') => {
    setSending(true)
    setError(null)
    
    try {
      const { error } = await supabase.from('device_commands').insert({
        device_id: deviceId,
        command,
        duration_seconds: command === 'turn_on' && duration > 0 ? duration : null,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // หมดอายุใน 5 นาที
        status: 'pending'
      })
      
      if (error) throw error
      
      // ✅ แสดงผลทันที (Optimistic UI)
      // (ในโปรเจกต์จริงอาจรอ Realtime update จาก ESP32)
      
    } catch (err: any) {
      console.error('Error sending command:', err)
      setError('❌ ส่งคำสั่งไม่สำเร็จ: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div className="p-4 text-center">⏳ โหลดอุปกรณ์...</div>
  }

  if (!device) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
        <AlertTriangle className="w-5 h-5 inline mr-2" />
        ไม่พบอุปกรณ์นี้ในระบบ
      </div>
    )
  }

  const isOnline = device.is_online && device.last_seen
  const lastSeen = device.last_seen ? new Date(device.last_seen).toLocaleTimeString('th-TH') : '-'

  return (
    <div className="p-4 bg-white rounded-xl border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">🔌 ควบคุมปั๊มน้ำ</h3>
        
        {/* สถานะออนไลน์ */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
          isOnline ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
          {isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
        </div>
      </div>

      {/* เวลาเห็นล่าสุด */}
      <p className="text-xs text-slate-500 mb-3">
        เห็นล่าสุด: {lastSeen}
      </p>

      {/* ปุ่มควบคุม */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <button
          onClick={() => sendCommand('turn_on')}
          disabled={sending || !isOnline}
          className="flex flex-col items-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <Power className="w-6 h-6" />
          <span className="text-sm font-medium">เปิด</span>
        </button>
        
        <button
          onClick={() => sendCommand('turn_off')}
          disabled={sending || !isOnline}
          className="flex flex-col items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <Power className="w-6 h-6 rotate-180" />
          <span className="text-sm font-medium">ปิด</span>
        </button>
        
        <button
          onClick={() => sendCommand('toggle')}
          disabled={sending || !isOnline}
          className="flex flex-col items-center gap-2 p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <RefreshCw className="w-6 h-6" />
          <span className="text-sm font-medium">สลับ</span>
        </button>
      </div>

      {/* ตั้งเวลาเปิดอัตโนมัติ */}
      <div className="border-t pt-3">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          ⏱️ เปิดนาน (วินาที) - ถ้าตั้งจะปิดอัตโนมัติ
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            max={3600}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            placeholder="เช่น 300 = 5 นาที"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={() => { setDuration(300); }}
            className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm"
          >
            5 นาที
          </button>
        </div>
      </div>

      {/* แสดงข้อความผิดพลาด */}
      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* คำแนะนำ */}
      <p className="text-xs text-slate-400 mt-3">
        💡 หมายเหตุ: คำสั่งจะหมดอายุใน 5 นาทีหากอุปกรณ์ไม่รับ
      </p>
    </div>
  )
}
