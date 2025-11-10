import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { DanaPayment } from 'dana-node'

const dana = new DanaPayment({
  clientId: process.env.DANA_CLIENT_ID!,
  clientSecret: process.env.DANA_CLIENT_SECRET!,
  isProduction: false, // Set to true for production
})

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
      where: { id: parseInt(orderId), userId: decoded.userId },
    })

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      )
    }

    if (!order.paymentId) {
      return NextResponse.json(
        { message: 'No payment initiated for this order' },
        { status: 400 }
      )
    }

    // Check payment status from DANA
    const paymentStatus = await dana.getPaymentStatus(order.paymentId)

    // Update order if status has changed
    if (paymentStatus.status !== order.paymentStatus) {
      let orderStatus: string

      switch (paymentStatus.status) {
        case 'SUCCESS':
          orderStatus = 'COMPLETED'
          break
        case 'FAILED':
          orderStatus = 'FAILED'
          break
        default:
          orderStatus = order.status
      }

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: orderStatus as any,
          paymentStatus: paymentStatus.status,
          updatedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      paymentStatus: paymentStatus.status,
      orderStatus: order.status,
    })
  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
