import { NextRequest, NextResponse } from 'next/server'
import midtransClient from 'midtrans-client'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, transaction_status, fraud_status } = body

    console.log('Payment webhook received:', { order_id, transaction_status, fraud_status })

    // Verify webhook signature (recommended for production)
    // const notificationJson = JSON.stringify(body)
    // const signature = crypto.createHmac('sha512', process.env.MIDTRANS_SERVER_KEY!)
    //   .update(notificationJson)
    //   .digest('hex')

    // Extract order ID from Midtrans order_id format: MDZ-{orderId}-{timestamp}
    const orderIdMatch = order_id.match(/^MDZ-(\d+)-\d+$/)
    if (!orderIdMatch) {
      console.error('Invalid order_id format:', order_id)
      return NextResponse.json({ message: 'Invalid order format' }, { status: 400 })
    }

    const orderId = parseInt(orderIdMatch[1])

    // Update order status based on payment status
    let newStatus: string = 'PENDING'
    let orderStatus: string = 'PENDING'

    switch (transaction_status) {
      case 'capture':
        if (fraud_status === 'challenge') {
          newStatus = 'CHALLENGE'
        } else if (fraud_status === 'accept') {
          newStatus = 'SUCCESS'
          orderStatus = 'COMPLETED'
        }
        break
      case 'settlement':
        newStatus = 'SUCCESS'
        orderStatus = 'COMPLETED'
        break
      case 'cancel':
      case 'deny':
      case 'expire':
        newStatus = 'FAILED'
        orderStatus = 'FAILED'
        break
      case 'pending':
        newStatus = 'PENDING'
        break
      default:
        newStatus = 'UNKNOWN'
    }

    // Update order in database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
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
      const message = `Payment Update!\nOrder ID: ${orderId}\nPayment Status: ${newStatus}\nOrder Status: ${orderStatus}\nAmount: Rp ${updatedOrder.finalAmount.toLocaleString()}\nUser: ${updatedOrder.user?.username || 'Guest'}`
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

    console.log(`Order ${orderId} payment status updated to ${newStatus}, order status to ${orderStatus}`)

    return NextResponse.json({
      message: 'Webhook processed successfully',
      orderId,
      paymentStatus: newStatus,
      orderStatus
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { message: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
