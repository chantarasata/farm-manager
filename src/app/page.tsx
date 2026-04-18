'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import TaskTable from '@/components/TaskTable'
import AddTaskModal from '@/components/AddTaskModal'
import ZoneMapModal from '@/components/ZoneMapModal'
// ✅ ลบ SensorCard ออกชั่วคราว (เพิ่มกลับเมื่อพร้อมทำ IoT)
import type { Zone, Task } from '@/types'

export default function DashboardPage() {
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [showAddTask, setShowAddTask] = useState(false)
  const [showMap, setShowMap] = useState(false)

  // ✅ ดึงโซนทั้งหมดเมื่อโหลดหน้า
  useEffect(() => {
    async function fetchZones() {
      try {
        const { data, error } = await supabase
          .from('zones')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setZones(data || [])
      } catch (err: any) {
        console.error('Error fetching zones:', err)
        setError(err.message || 'ไม่สามารถโหลดข้อมูลโซนได้')
      } finally {
        setLoading(false)
      }
    }
    fetchZones()
  }, [])

  // ✅ ดึงงานเมื่อเลือกโซน (แก้ไข Null Safety)
  useEffect(() => {
    if (!selectedZone) {
      setTasks([])
      return
    }
    
    async function fetchTasks() {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('zone_id', selectedZone!.id)
        .order('due_date', { ascending: true })
      
      if (error) console.error('Error fetching tasks:', error)
      else setTasks(data || [])
      setLoading(false)
    }
    fetchTasks()
  }, [selectedZone])

  // ✅ แสดงหน้าโหลด
  if (loading && zones.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600">⏳ กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  // ✅ แสดงหน้าเมื่อมีข้อผิดพลาด
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg border">
          <p className="text-xl font-bold text-red-600 mb-2">❌ เกิดข้อผิดพลาด</p>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            รีเฟรชหน้า
          </button>
        </div>
      </div>
    )
  }

  // ✅ หน้าหลัก (Dashboard)
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar: รายการโซน */}
      <Sidebar 
        zones={zones} 
        selectedId={selectedZone?.id} 
        onSelect={setSelectedZone} 
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">📊 แดชบอร์ดจัดการฟาร์ม</h1>
          <p className="text-slate-500">เลือกโซนเพื่อดูตารางการดูแลและบันทึกผล</p>
        </header>

        {/* 📈 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="โซนทั้งหมด" 
            value={zones.length} 
            color="bg-emerald-50 text-emerald-700" 
          />
          <StatCard 
            title="งานคั่งค้าง" 
            value={tasks.filter(t => t.status === 'pending').length} 
            color="bg-amber-50 text-amber-700" 
          />
          <StatCard 
            title="เสร็จสิ้นแล้ว" 
            value={tasks.filter(t => t.status === 'completed').length} 
            color="bg-green-50 text-green-700" 
          />
          <StatCard 
            title="พื้นที่รวม" 
            value={`${zones.reduce((sum, z) => sum + (z.area_sqm || 0), 0).toLocaleString()} ตร.ม.`} 
            color="bg-blue-50 text-blue-700" 
          />
        </div>

        {/* 🗺️ Main Content Area */}
        {selectedZone ? (
          <div className="bg-white rounded-xl shadow-sm border p-5">
            {/* Zone Header + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  📍 โซน {selectedZone.name}
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedZone.crop_type || 'ไม่ระบุพืช'} | 
                  พื้นที่: {selectedZone.area_sqm?.toLocaleString()} ตร.ม. | 
                  สถานะ: <span className={`font-medium ${
                    selectedZone.status === 'ปกติ' ? 'text-green-600' : 'text-amber-600'
                  }`}>{selectedZone.status}</span>
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowMap(true)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium transition flex items-center gap-2"
                >
                  🗺️ ดูแผนที่
                </button>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition flex items-center gap-2"
                >
                  ➕ เพิ่มงาน
                </button>
              </div>
            </div>

            {/* 📋 Task Table */}
            <div className="mt-4">
              <TaskTable 
                tasks={tasks} 
                zoneId={selectedZone!.id}
                onTaskUpdate={() => {
                  supabase
                    .from('tasks')
                    .select('*')
                    .eq('zone_id', selectedZone!.id)
                    .order('due_date', { ascending: true })
                    .then(({ data, error }) => {
                      if (error) console.error('Error refreshing tasks:', error)
                      else setTasks(data || [])
                    })
                }} 
              />
            </div>
          </div>
        ) : (
          /* ✅ Empty State: เมื่อยังไม่ได้เลือกโซน */
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border-2 border-dashed border-slate-300 text-slate-500">
            <p className="text-lg mb-2">🌱 ยังไม่ได้เลือกโซน</p>
            <p className="text-sm text-center max-w-md">
              คลิกที่รายการโซนทางด้านซ้ายเพื่อดูตารางการดูแล
            </p>
            {zones.length === 0 && (
              <a 
                href="/editor" 
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition inline-flex items-center gap-2"
              >
                ✏️ ไปวาดแผนผังที่ดิน
              </a>
            )}
          </div>
        )}
      </main>

      {/* ✅ Modals */}
      {showAddTask && selectedZone && (
        <AddTaskModal
          zoneId={selectedZone.id}
          zoneName={selectedZone.name}
          onClose={() => setShowAddTask(false)}
          onTaskAdded={() => {
            supabase
              .from('tasks')
              .select('*')
              .eq('zone_id', selectedZone!.id)
              .order('due_date', { ascending: true })
              .then(({ data }) => { if (data) setTasks(data) })
          }}
        />
      )}

      {showMap && selectedZone && (
        <ZoneMapModal
          zone={selectedZone}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  )
}

// ✅ Helper Component: Stat Card
function StatCard({ title, value, color }: { 
  title: string
  value: string | number 
  color: string 
}) {
  return (
    <div className={`${color} rounded-xl p-4 shadow-sm border`}>
      <p className="text-sm opacity-80">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}
