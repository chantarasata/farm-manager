'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
// ✅ แก้ไข: เปลี่ยน Humidity เป็น CloudFog (lucide-react ไม่มี Humidity)
import { Droplets, Thermometer, CloudFog, Battery } from 'lucide-react'

export default function SensorCard({ zoneId }: { zoneId: string }) {
  const [reading, setReading] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLatest() {
      const { data } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('zone_id', zoneId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single()
      if (data) setReading(data)
      setLoading(false)
    }
    fetchLatest()

    const channel = supabase
      .channel(`sensor-${zoneId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'sensor_readings', 
        filter: `zone_id=eq.${zoneId}` 
      }, (payload) => {
        setReading(payload.new)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [zoneId])

  if (loading || !reading) return <div className="p-4 text-center text-slate-500">⏳ รอข้อมูลเซนเซอร์...</div>

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white rounded-xl border">
      <Metric icon={<Droplets className="text-blue-500" />} label="ความชื้นดิน" value={`${reading.soil_moisture?.toFixed(1) || '-'}%`} />
      <Metric icon={<Thermometer className="text-red-500" />} label="อุณหภูมิ" value={`${reading.temperature?.toFixed(1) || '-'}°C`} />
      {/* ✅ แก้ไข: ใช้ CloudFog แทน Humidity */}
      <Metric icon={<CloudFog className="text-cyan-500" />} label="ความชื้นอากาศ" value={`${reading.humidity?.toFixed(1) || '-'}%`} />
      <Metric icon={<Battery className="text-green-500" />} label="แบตเตอรี่" value={`${reading.battery_level?.toFixed(0) || '-'}%`} />
    </div>
  )
}

function Metric({ icon, label, value }: any) {
  return (
    <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg">
      <div className="mb-1">{icon}</div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-800">{value}</p>
    </div>
  )
}
