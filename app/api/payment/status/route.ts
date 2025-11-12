import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      userId: number
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { message: 'Order ID is required' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      select: {
        id: true,
        paymentStatus: true,
        status: true,
        paymentId: true,
        finalAmount: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order belongs to user
    const fullOrder = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    })

    if (fullOrder?.userId !== decoded.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      order: {
        id: order.id,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        paymentId: order.paymentId,
        amount: order.finalAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    })

  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { message: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}
