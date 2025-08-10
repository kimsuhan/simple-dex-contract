import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/pools/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data, {
      status: 200,
    })
  } catch (error) {
    console.error('Stats API 프록시 에러:', error)
    
    return NextResponse.json(
      { 
        error: '통계 데이터를 가져올 수 없습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}