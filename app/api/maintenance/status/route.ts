import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'maintenance.json')
    const data = fs.readFileSync(filePath, 'utf8')
    const maintenance = JSON.parse(data)
    return NextResponse.json({ active: maintenance.active })
  } catch (error) {
    return NextResponse.json({ active: false }, { status: 200 }) // Default to false if file not found
  }
}
