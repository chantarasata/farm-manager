'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Clock, Repeat } from 'lucide-react'
import type { Task } from '@/types'

const DAYS_TH = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']

export default function TaskTable({ tasks, zoneId, onTaskUpdate }: { 
  tasks: Task[]
  zoneId: string
  onTaskUpdate: () => void
}) {
  const [updating, setUpdating] = useState<string | null>(null)

  // ฟังก์ชันช่วยสร้างป้ายการซ้ำ
  const getRecurrenceLabel = (task: Task): string => {
    if (!task.recurrence_type || task.recurrence_type === 'once') return ''
    if (task.recurrence_type === 'daily') return 'ทุกวัน'
    if (task.recurrence_type === 'weekly') {
      const days = (task.recurrence_days || []).map(d => DAYS_TH[d-1]).join(',')
      return `ทุกสัปดาห์ (${days})`
    }
    if (task.recurrence_type === 'custom') {
      const days = (task.recurrence_days || []).map(d => DAYS_TH[d-1]).join(',')
      return `ซ้ำ: ${days}`
    }
    return ''
  }

  const toggleTask = async (taskId: string, currentStatus: string) => {
    setUpdating(taskId)
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)
    
    if (error) alert('❌ อัปเดตสถานะไม่สำเร็จ: ' + error.message)
    else onTaskUpdate()
    setUpdating(null)
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
        <p>📋 ยังไม่มีรายการงานในโซนนี้</p>
        <p className="text-sm mt-1">กด "➕ เพิ่มงาน" เพื่อเริ่มต้น</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-100 text-slate-700">
            <th className="p-3 border-b">หัวข้อการดูแล</th>
            <th className="p-3 border-b">วันที่/เวลา</th>
            <th className="p-3 border-b">สถานะ</th>
            <th className="p-3 border-b">ดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {/* ✅ สำคัญ: ต้องมี tasks.map((t) => ...) ครอบทุกแถว */}
          {tasks.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50 transition">
              <td className="p-3 border-b">
                <div className="font-medium text-slate-800">{t.title}</div>
                
                {/* ✅ แสดงช่วงเวลา */}
                {(t.time_start || t.time_end) && (
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock size={12} />
                    {t.time_start} - {t.time_end || 'ไม่กำหนด'}
                  </div>
                )}
                
                {/* ✅ แสดงป้ายการซ้ำ */}
                {t.recurrence_type && t.recurrence_type !== 'once' && (
                  <div className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                    <Repeat size={12} />
                    {getRecurrenceLabel(t)}
                  </div>
                )}
              </td>
              
              <td className="p-3 border-b text-slate-600">
                {t.next_due_date 
                  ? new Date(t.next_due_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
                  : t.due_date ? new Date(t.due_date).toLocaleDateString('th-TH') : '-'
                }
              </td>
              
              <td className="p-3 border-b">
                {t.status === 'completed' ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">✅ เสร็จสิ้น</span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 font-medium">⏳ รอทำ</span>
                )}
              </td>
              
              <td className="p-3 border-b">
                <button
                  onClick={() => toggleTask(t.id, t.status)}
                  disabled={updating === t.id}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
                    t.status === 'completed' ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {updating === t.id ? 'กำลังอัปเดต...' : t.status === 'completed' ? 'ยกเลิก' : 'ทำเสร็จ'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
