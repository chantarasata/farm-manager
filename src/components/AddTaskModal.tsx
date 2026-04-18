'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Calendar, Clock, Repeat } from 'lucide-react'

const DAYS_TH = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
const DAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function AddTaskModal({ 
  zoneId, 
  zoneName, 
  onClose, 
  onTaskAdded 
}: { 
  zoneId: string
  zoneName: string
  onClose: () => void
  onTaskAdded: () => void
}) {
  const [title, setTitle] = useState('')
  const [taskType, setTaskType] = useState<'น้ำ' | 'ปุ๋ย' | 'ตรวจสอบ' | 'เก็บเกี่ยว' | 'อื่นๆ'>('น้ำ')
  const [dueDate, setDueDate] = useState('')
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')
  
  // ✅ Recurrence State
  const [recurrenceType, setRecurrenceType] = useState<'once' | 'daily' | 'weekly' | 'custom'>('once')
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([])
  const [recurrenceWeeks, setRecurrenceWeeks] = useState(1)
  
  const [loading, setLoading] = useState(false)

  const toggleDay = (day: number) => {
    setRecurrenceDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !dueDate) return alert('กรุณากรอกชื่องานและวันที่')
    if (recurrenceType !== 'once' && recurrenceDays.length === 0 && recurrenceType !== 'daily') {
      return alert('กรุณาเลือกวันที่สำหรับงานซ้ำ')
    }

    setLoading(true)
    
    // ✅ เตรียมข้อมูลสำหรับบันทึก
    const taskData = {
      zone_id: zoneId,
      title,
      task_type: taskType,
      due_date: dueDate,
      time_start: timeStart || null,
      time_end: timeEnd || null,
      recurrence_type: recurrenceType,
      recurrence_days: recurrenceType === 'once' ? null : recurrenceDays,
      recurrence_weeks: recurrenceType === 'weekly' ? recurrenceWeeks : null,
      status: 'pending' as const,
      // next_due_date จะถูกคำนวณโดย Trigger อัตโนมัติ
    }

    const { error } = await supabase.from('tasks').insert(taskData)

    if (error) {
      alert('❌ เพิ่มงานไม่สำเร็จ: ' + error.message)
    } else {
      alert('✅ เพิ่มงานสำเร็จ!')
      onTaskAdded()
      onClose()
    }
    setLoading(false)
  }

  const getRecurrenceLabel = () => {
    if (recurrenceType === 'once') return 'ครั้งเดียว'
    if (recurrenceType === 'daily') return 'ทุกวัน'
    if (recurrenceType === 'weekly') {
      const days = recurrenceDays.map(d => DAYS_TH[d-1]).join(', ')
      return `ทุกสัปดาห์ (${days})`
    }
    if (recurrenceType === 'custom') {
      const days = recurrenceDays.map(d => DAYS_TH[d-1]).join(', ')
      return `กำหนดเอง: ${days}`
    }
    return ''
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={20} /> เพิ่มงานใหม่
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-4">📍 โซน: <span className="font-medium">{zoneName}</span></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ชื่องาน */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่องาน *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น รดน้ำเช้า, ใส่ปุ๋ยสูตรเสมอ"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* ประเภทงาน */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทงาน</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="น้ำ">💧 รดน้ำ/ระบบน้ำ</option>
              <option value="ปุ๋ย">🌱 ใส่ปุ๋ย</option>
              <option value="ตรวจสอบ">🔍 ตรวจสอบ</option>
              <option value="เก็บเกี่ยว">🌾 เก็บเกี่ยว</option>
              <option value="อื่นๆ">📋 อื่นๆ</option>
            </select>
          </div>

          {/* วันที่เริ่ม */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">วันที่เริ่ม *</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* ✅ ช่วงเวลา */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Clock size={14} /> เวลาเริ่ม
              </label>
              <input
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Clock size={14} /> เวลาจบ
              </label>
              <input
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* ✅ การซ้ำ */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
              <Repeat size={16} /> การทำซ้ำ
            </label>
            
            {/* ประเภทการซ้ำ */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { value: 'once', label: 'ครั้งเดียว' },
                { value: 'daily', label: 'ทุกวัน' },
                { value: 'weekly', label: 'ทุกสัปดาห์' },
                { value: 'custom', label: 'กำหนดวัน' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRecurrenceType(opt.value as any)}
                  className={`px-3 py-2 rounded-lg text-sm border transition ${
                    recurrenceType === opt.value
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* เลือกวัน (สำหรับ weekly/custom) */}
            {recurrenceType !== 'once' && recurrenceType !== 'daily' && (
              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-2">เลือกวันที่ต้องการ:</p>
                <div className="flex gap-1">
                  {DAYS_TH.map((day, idx) => {
                    const dayNum = idx + 1
                    const isSelected = recurrenceDays.includes(dayNum)
                    return (
                      <button
                        key={dayNum}
                        type="button"
                        onClick={() => toggleDay(dayNum)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title={DAYS_EN[idx]}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ซ้ำทุก ___ สัปดาห์ */}
            {recurrenceType === 'weekly' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">ซ้ำทุก</span>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={recurrenceWeeks}
                  onChange={(e) => setRecurrenceWeeks(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 border border-slate-300 rounded text-center"
                />
                <span className="text-sm text-slate-600">สัปดาห์</span>
              </div>
            )}

            {/* แสดงสรุป */}
            {recurrenceType !== 'once' && (
              <p className="text-xs text-emerald-600 mt-2 bg-emerald-50 px-3 py-2 rounded">
                🔄 {getRecurrenceLabel()}
              </p>
            )}
          </div>

          {/* ปุ่ม */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกงาน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
