import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ✅ สร้าง Supabase Client ด้วย Service Role Key (สำหรับ Server เท่านั้น)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ฟังก์ชันส่ง LINE Notify
async function sendLineNotify(message: string) {
  const token = process.env.LINE_NOTIFY_TOKEN
  if (!token) {
    console.warn('⚠️ LINE_NOTIFY_TOKEN ไม่ถูกตั้งค่า')
    return false
  }

  try {
    const res = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `message=${encodeURIComponent(message)}`,
    })
    return res.ok
  } catch (err) {
    console.error('Failed to send LINE notify:', err)
    return false
  }
}

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const todayDow = new Date().getDay() // 0=อาทิตย์, 1=จันทร์, ..., 6=เสาร์
    const normalizedDow = todayDow === 0 ? 7 : todayDow // แปลงเป็น 1-7 (1=จันทร์, 7=อาทิตย์)

    // ✅ ดึงงานที่สถานะ = 'pending' และ next_due_date <= วันนี้
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`*, zones(name)`)
      .eq('status', 'pending')
      .lte('next_due_date', today)
      .order('time_start', { ascending: true })

    if (error) throw error
    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ status: 'ok', message: 'ไม่มีงานที่ต้องทำวันนี้' })
    }

    // ✅ กรองงานซ้ำด้วย JavaScript (เสถียรกว่าการซ้อนเงื่อนไขใน Supabase Query)
    const dueTasks = tasks.filter((t: any) => {
      if (!t.recurrence_type || t.recurrence_type === 'once') return true
      if (t.recurrence_type === 'daily') return true
      if (t.recurrence_type === 'weekly' || t.recurrence_type === 'custom') {
        return t.recurrence_days?.includes(normalizedDow)
      }
      return false
    })

    if (dueTasks.length === 0) {
      return NextResponse.json({ status: 'ok', message: 'ไม่มีงานที่ตรงกับวันนี้' })
    }

    // ✅ จัดรูปแบบข้อความสำหรับ LINE
    const msg = `🌿 งานวันนี้ (${dueTasks.length} รายการ):\n\n` +
      dueTasks.map((t: any) => {
        const time = t.time_start ? `⏰ ${t.time_start}${t.time_end ? '-' + t.time_end : ''}` : ''
        const repeat = t.recurrence_type !== 'once' ? ' 🔁' : ''
        return `• ${t.zones?.name || 'ไม่ระบุโซน'}: ${t.title}${time}${repeat}`
      }).join('\n')

    await sendLineNotify(msg)

    return NextResponse.json({
      status: 'success',
      tasksCount: dueTasks.length,
      message: 'ส่งแจ้งเตือนสำเร็จ'
    })
  } catch (err: any) {
    console.error('❌ Cron Job Error:', err)
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    )
  }
}
