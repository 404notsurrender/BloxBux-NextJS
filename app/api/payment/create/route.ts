import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

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
      username: string
    }

    const { orderId, paymentMethod } = await request.json()

    if (!orderId || !paymentMethod) {
      return NextResponse.json(
        { message: 'Order ID and payment method are required' },
        { status: 400 }
      )
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { user: true }
    })

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order belongs to user
    if (order.userId !== decoded.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    // DANA Payment Gateway Integration using dashboard.dana.id API
    const danaConfig = {
      merchantId: process.env.DANA_MERCHANT_ID!,
      secretKey: process.env.DANA_SECRET_KEY!,
      baseUrl: process.env.DANA_BASE_URL || 'https://dashboard.dana.id'
    }

    // Create payment request for DANA Hosted Checkout
    const paymentRequest = {
      merchantId: danaConfig.merchantId,
      orderId: `MDZ-${order.id}-${Date.now()}`,
      amount: Math.round(order.finalAmount),
      currency: 'IDR',
      description: `${order.amount} Robux Top-up`,
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/payment/callback`,
      redirectUrl: `${process.env.NEXTAUTH_URL}/orders`,
      paymentMethod: paymentMethod, // 'DANA', 'BANK_TRANSFER', etc.
      customerInfo: {
        customerName: order.user?.username || 'Guest',
        customerEmail: `${order.user?.username || 'guest'}@mdzbux.com`,
      },
      items: [
        {
          id: `robux-${order.amount}`,
          name: `${order.amount} Robux Top-up`,
          price: Math.round(order.finalAmount),
          quantity: 1
        }
      ]
    }

    // Create signature for DANA API (HMAC-SHA256)
    const crypto = require('crypto')
    const signatureString = `${danaConfig.merchantId}${paymentRequest.orderId}${paymentRequest.amount}${danaConfig.secretKey}`
    const signature = crypto.createHmac('sha256', danaConfig.secretKey).update(signatureString).digest('hex')

    // Call DANA API to create hosted checkout payment
    const danaResponse = await fetch(`${danaConfig.baseUrl}/api/v2/payment/hosted-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${danaConfig.secretKey}`,
        'X-Signature': signature,
        'X-Timestamp': new Date().toISOString()
      },
      body: JSON.stringify(paymentRequest)
    })

    if (!danaResponse.ok) {
      const errorData = await danaResponse.text()
      console.error('DANA API Error:', errorData)
      throw new Error('Failed to create DANA payment')
    }

    const danaData = await danaResponse.json()

    // Update order with payment details
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: danaData.paymentId || danaData.checkoutUrl,
        paymentStatus: 'PENDING'
      }
    })

    return NextResponse.json({
      message: 'Payment created successfully',
      payment: {
        paymentId: danaData.paymentId,
        paymentUrl: danaData.checkoutUrl || danaData.paymentUrl,
        orderId: paymentRequest.orderId
      }
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { message: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
