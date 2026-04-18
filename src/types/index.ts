export type Task = {
  id: string
  zone_id: string
  title: string
  task_type?: 'ปุ๋ย' | 'น้ำ' | 'ตรวจสอบ' | 'เก็บเกี่ยว' | 'อื่นๆ'
  due_date?: string           // วันที่เริ่ม (ครั้งแรก)
  time_start?: string         // เวลาเริ่ม (เช่น "08:00")
  time_end?: string           // เวลาจบ (เช่น "10:00")
  
  // ✅ ส่วนของงานซ้ำ
  recurrence_type?: 'once' | 'daily' | 'weekly' | 'custom'
  recurrence_days?: number[]  // [1,2,3,4,5,6,7] 1=จันทร์, 7=อาทิตย์
  recurrence_weeks?: number   // ซ้ำทุก ___ สัปดาห์
  
  next_due_date?: string      // วันที่ต้องทำครั้งถัดไป (คำนวณอัตโนมัติ)
  
  status: 'pending' | 'completed' | 'skipped'
  created_at: string
}

// ✅ Helper Type สำหรับฟอร์ม
export type TaskFormValues = Omit<Task, 'id' | 'zone_id' | 'created_at' | 'status'> & {
  zone_id: string
}
