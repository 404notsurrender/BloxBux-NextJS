import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { DanaPayment } from 'dana-node'

const dana = new DanaPayment({
  clientId: process.env.DANA_CLIENT_ID!,
  clientSecret: process.env.DANA_CLIENT_SECRET!,
  isProduction: false, // Set to true for production
})

export async function POST(request: NextRequest) {
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

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { message: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId), userId: decoded.userId },
    })

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json(
        { message: 'Order already paid' },
        { status: 400 }
      )
    }

    // Create payment request
    const paymentData = {
      orderId: `MDZ-${order.id}`,
      amount: order.finalAmount,
      currency: 'IDR',
      description: `Top up ${order.amount} Robux`,
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback`,
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/orders?payment=success`,
    }

    const paymentResponse = await dana.createPayment(paymentData)

    // Update order with payment ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: paymentResponse.paymentId,
        paymentStatus: 'PENDING',
      },
    })

    return NextResponse.json({
      message: 'Payment created successfully',
      paymentUrl: paymentResponse.paymentUrl,
      paymentId: paymentResponse.paymentId,
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
