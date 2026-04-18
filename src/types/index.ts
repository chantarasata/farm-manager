// ✅ ZoneDraft: ใช้เฉพาะในหน้า Editor (ยังไม่บันทึก)
export type ZoneDraft = {
  id: string              // ชั่วคราว เช่น 'draft-1234567890'
  name: string            // ชื่อโซน เช่น 'โซน A-1234'
  points: number[][]      // พิกัดจุด [[x1,y1], [x2,y2], ...]
  area: number            // พื้นที่คำนวณ (ตร.ม.)
}

// ✅ Zone: ข้อมูลโซนที่บันทึกใน Supabase แล้ว
export type Zone = {
  id: string
  name: string
  crop_type?: string              // ประเภทพืช
  coordinates: number[][]         // พิกัด (เก็บเป็น JSONB ใน DB)
  area_sqm?: number               // พื้นที่ (ตร.ม.)
  status: 'ปกติ' | 'ต้องดูแล' | 'เก็บเกี่ยว' | 'พักแปลง'
  map_url?: string                // URL ภาพแผนที่ (ถ้าอัปโหลด)
  created_at: string
}

// ✅ Task: ข้อมูลงานดูแล
export type Task = {
  id: string
  zone_id: string
  title: string
  task_type?: 'ปุ๋ย' | 'น้ำ' | 'ตรวจสอบ' | 'เก็บเกี่ยว' | 'อื่นๆ'
  due_date?: string               // วันที่เริ่ม (ครั้งแรก)
  time_start?: string             // เวลาเริ่ม (เช่น "08:00")
  time_end?: string               // เวลาจบ (เช่น "10:00")
  
  // ✅ ส่วนของงานซ้ำ
  recurrence_type?: 'once' | 'daily' | 'weekly' | 'custom'
  recurrence_days?: number[]      // [1,2,3,4,5,6,7] 1=จันทร์, 7=อาทิตย์
  recurrence_weeks?: number       // ซ้ำทุก ___ สัปดาห์
  
  next_due_date?: string          // วันที่ต้องทำครั้งถัดไป (คำนวณอัตโนมัติ)
  
  status: 'pending' | 'completed' | 'skipped'
  created_at: string
}

// ✅ Helper Type สำหรับฟอร์มเพิ่มงาน
export type TaskFormValues = Omit<Task, 'id' | 'zone_id' | 'created_at' | 'status'> & {
  zone_id: string
}
