import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { amount, price, discount, finalAmount } = await request.json()

    if (!amount || !price || discount === undefined || !finalAmount) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // For guest orders, we'll create an order without userId
    // In a real app, you might want to store guest info differently
    const order = await prisma.order.create({
      data: {
        amount,
        discount,
        finalAmount,
        // userId is optional in schema for guest orders
      },
    })

    // Send Telegram notification
    try {
      const message = `New Guest Order!\nAmount: ${amount} Robux\nPrice: Rp ${price}\nDiscount: ${discount * 100}%\nFinal Amount: Rp ${finalAmount}\nOrder ID: ${order.id}`
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
      message: 'Guest order created successfully',
      order: {
        id: order.id,
        amount: order.amount,
        discount: order.discount,
        finalAmount: order.finalAmount,
        status: order.status,
        createdAt: order.createdAt,
      },
    })
  } catch (error) {
    console.error('Guest order creation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
