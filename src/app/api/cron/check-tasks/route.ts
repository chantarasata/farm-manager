// เพิ่มส่วนตรวจสอบงานที่มี recurrence
export async function GET() {
  const today = new Date().toISOString().split('T')[0]
  const todayDow = new Date().getDay() // 0=อาทิตย์, 1=จันทร์, ...
  const normalizedDow = todayDow === 0 ? 7 : todayDow // แปลงเป็น 1-7

  // ✅ ดึงงานที่ต้องทำวันนี้ (รวมถึงงานซ้ำ)
  const {  tasks } = await supabaseAdmin
    .from('tasks')
    .select(`*, zones(name)`)
    .eq('status', 'pending')
    .or(`
      next_due_date.eq.${today},
      and(recurrence_type.eq.daily,next_due_date.lte.${today}),
      and(recurrence_type.eq.weekly,recurrence_days.cs.{${normalizedDow}},next_due_date.lte.${today}),
      and(recurrence_type.eq.custom,recurrence_days.cs.{${normalizedDow}},next_due_date.lte.${today})
    `)

  if (!tasks?.length) return NextResponse.json({ status: 'no-tasks' })

  // ✅ จัดกลุ่มและส่งแจ้งเตือน
  const msg = `🌿 งานวันนี้ (${tasks.length} รายการ):\n` +
    tasks.map(t => {
      const time = t.time_start ? ` เวลา ${t.time_start}${t.time_end ? '-' + t.time_end : ''}` : ''
      const repeat = t.recurrence_type !== 'once' ? ' 🔁' : ''
      return `• ${t.zones?.name}: ${t.title}${time}${repeat}`
    }).join('\n')

  await sendLineNotify(msg)
  
  // ✅ อัปเดต next_due_date สำหรับงานที่ทำเสร็จแล้ว (ถ้าต้องการ)
  // หรือปล่อยให้ Trigger คำนวณให้อัตโนมัติเมื่องานถูกทำเสร็จ
  
  return NextResponse.json({ status: 'sent', count: tasks.length })
}
