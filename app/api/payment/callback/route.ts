import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      orderId,
      paymentId,
      status,
      amount,
      signature
    } = body

    console.log('DANA Payment Callback received:', { orderId, paymentId, status, amount })

    // Verify signature (recommended for production)
    // const expectedSignature = crypto.createHmac('sha256', process.env.DANA_SECRET_KEY!)
    //   .update(`${orderId}${paymentId}${status}${amount}${process.env.DANA_SECRET_KEY!}`)
    //   .digest('hex')

    // if (signature !== expectedSignature) {
    //   return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
    // }

    // Extract order ID from DANA orderId format: MDZ-{orderId}-{timestamp}
    const orderIdMatch = orderId.match(/^MDZ-(\d+)-\d+$/)
    if (!orderIdMatch) {
      console.error('Invalid orderId format:', orderId)
      return NextResponse.json({ message: 'Invalid order format' }, { status: 400 })
    }

    const dbOrderId = parseInt(orderIdMatch[1])

    // Update order status based on payment status
    let newStatus: string = 'PENDING'
    let orderStatus: string = 'PENDING'

    switch (status) {
      case 'SUCCESS':
      case 'COMPLETED':
        newStatus = 'SUCCESS'
        orderStatus = 'COMPLETED'
        break
      case 'FAILED':
      case 'CANCELLED':
      case 'EXPIRED':
        newStatus = 'FAILED'
        orderStatus = 'FAILED'
        break
      case 'PENDING':
        newStatus = 'PENDING'
        break
      default:
        newStatus = 'UNKNOWN'
    }

    // Update order in database
    const updatedOrder = await prisma.order.update({
      where: { id: dbOrderId },
      data: {
        paymentStatus: newStatus,
        status: orderStatus as any,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    })

    // Send Telegram notification for payment updates
    try {
      const message = `💰 Payment Update!\nOrder ID: ${dbOrderId}\nPayment Status: ${newStatus}\nOrder Status: ${orderStatus}\nAmount: Rp ${updatedOrder.finalAmount.toLocaleString()}\nUser: ${updatedOrder.user?.username || 'Guest'}\nPayment Method: DANA`
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
        }),
      })
    } catch (telegramError) {
      console.error('Telegram notification failed:', telegramError)
    }

    console.log(`Order ${dbOrderId} payment status updated to ${newStatus}, order status to ${orderStatus}`)

    return NextResponse.json({
      message: 'Callback processed successfully',
      orderId: dbOrderId,
      paymentStatus: newStatus,
      orderStatus
    })

  } catch (error) {
    console.error('Callback processing error:', error)
    return NextResponse.json(
      { message: 'Callback processing failed' },
      { status: 500 }
    )
  }
}

// Handle GET requests for payment status checks
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  if (!orderId) {
    return NextResponse.json({ message: 'Order ID required' }, { status: 400 })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      select: {
        paymentStatus: true,
        status: true,
        paymentId: true
      }
    })

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      paymentId: order.paymentId
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ message: 'Status check failed' }, { status: 500 })
  }
}
