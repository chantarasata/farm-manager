/** @type {import('next').NextConfig} */
const nextConfig = {
  // บังคับให้ Next.js แปลงไฟล์ konva/react-konva เป็น CommonJS ก่อน
  transpilePackages: ['react-konva', 'konva'],
}

export default nextConfig
