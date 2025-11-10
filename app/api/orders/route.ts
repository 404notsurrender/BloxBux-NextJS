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
    }

    const { amount, price, discount, finalAmount, topupMethod, gameUsername, gamePassword, playerId, estimatedTime } = await request.json()

    if (!amount || !price || discount === undefined || !finalAmount) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    const order = await prisma.order.create({
      data: {
        userId: decoded.userId,
        amount,
        discount,
        finalAmount,
        topupMethod,
        gameUsername,
        gamePassword,
        playerId,
        estimatedTime,
        paymentStatus: 'PENDING',
      },
    })

    // Send Telegram notification
    try {
      const message = `New Order!\nUser ID: ${decoded.userId}\nAmount: ${amount} Robux\nPrice: Rp ${price}\nDiscount: ${discount * 100}%\nFinal Amount: Rp ${finalAmount}\nTop-up Method: ${topupMethod}\nEstimated Time: ${estimatedTime}\nOrder ID: ${order.id}`
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
      // Don't fail the order if Telegram fails
    }

    return NextResponse.json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        amount: order.amount,
        discount: order.discount,
        finalAmount: order.finalAmount,
        status: order.status,
        topupMethod: order.topupMethod,
        estimatedTime: order.estimatedTime,
        createdAt: order.createdAt,
      },
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const orders = await prisma.order.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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
      role: string
    }

    // Check if user is admin
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json(
        { message: 'Order ID and status are required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['PENDING', 'COMPLETED', 'FAILED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      )
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Order status updated successfully',
      order: updatedOrder,
    })
  } catch (error) {
    console.error('Order status update error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
