import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Simple health check - could be expanded to check database, etc.
    return NextResponse.json({ status: 'ok', message: 'API is healthy' })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'API is not healthy' },
      { status: 500 }
    )
  }
}
