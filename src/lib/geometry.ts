/**
 * คำนวณพื้นที่ Polygon ด้วยสูตร Shoelace
 * @param pixelsPerMeter อัตราส่วนพิกเซลต่อเมตร (ค่าเริ่มต้น 10)
 */
export function calculatePolygonArea(points: number[][], pixelsPerMeter: number = 10): number {
  if (points.length < 3) return 0
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    area += points[i][0] * points[j][1]
    area -= points[j][0] * points[i][1]
  }
  const pixelArea = Math.abs(area) / 2
  return Math.round(pixelArea / (pixelsPerMeter * pixelsPerMeter))
}
