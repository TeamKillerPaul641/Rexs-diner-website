import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'maintenance.json')
    const data = fs.readFileSync(filePath, 'utf8')
    const maintenance = JSON.parse(data)
    maintenance.active = !maintenance.active
    fs.writeFileSync(filePath, JSON.stringify(maintenance, null, 2))
    return NextResponse.json({ success: true, active: maintenance.active })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle maintenance mode' }, { status: 500 })
  }
}
