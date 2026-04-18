// ในส่วนแสดงผลแต่ละแถว (เพิ่มส่วนแสดงเวลาและการซ้ำ)
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
    {/* ✅ แสดงการซ้ำ */}
    {t.recurrence_type && t.recurrence_type !== 'once' && (
      <div className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
        <Repeat size={12} />
        {getRecurrenceLabel(t)}
      </div>
    )}
  </td>
  <td className="p-3 border-b text-slate-600">
    {t.next_due_date 
      ? new Date(t.next_due_date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })
      : t.due_date ? new Date(t.due_date).toLocaleDateString('th-TH') : '-'
    }
  </td>
  {/* ... คอลัมน์อื่นๆ คงเดิม ... */}
</tr>

// ✅ Helper Function สำหรับแสดงป้ายการซ้ำ
function getRecurrenceLabel(task: Task): string {
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

const DAYS_TH = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
