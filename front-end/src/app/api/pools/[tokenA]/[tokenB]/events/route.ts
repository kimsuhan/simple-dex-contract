import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenA: string; tokenB: string } }
) {
  try {
    const { tokenA, tokenB } = params
    
    // URL 파라미터 추출
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    
    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams()
    if (type) queryParams.append('type', type)
    if (limit) queryParams.append('limit', limit)
    if (offset) queryParams.append('offset', offset)
    
    const queryString = queryParams.toString()
    const backendUrl = `${BACKEND_URL}/pools/${tokenA}/${tokenB}/events${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(backendUrl, {
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
    console.error('Events API 프록시 에러:', error)
    
    return NextResponse.json(
      { 
        error: '이벤트 데이터를 가져올 수 없습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}