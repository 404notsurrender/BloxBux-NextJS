import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DanaPayment } from 'dana-node'
import crypto from 'crypto'

const dana = new DanaPayment({
  clientId: process.env.DANA_CLIENT_ID!,
  clientSecret: process.env.DANA_CLIENT_SECRET!,
  isProduction: false, // Set to true for production
})

// DANA Public Key for signature verification
const DANA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnaKVGRbin4Wh4KN35OPh
ytJBjYTz7QZKSZjmHfiHxFmulfT87rta+IvGJ0rCBgg+1EtKk1hX8G5gPGJs1htJ
5jHa3/jCk9l+luzjnuT9UVlwJahvzmFw+IoDoM7hIPjsLtnIe04SgYo0tZBpEmkQ
vUGhmHPqYnUGSSMIpDLJDvbyr8gtwluja1SbRphgDCoYVXq+uUJ5HzPS049aaxTS
nfXh/qXuDoB9EzCrgppLDS2ubmk21+dr7WaO/3RFjnwx5ouv6w+iC1XOJKar3CTk
X6JV1OSST1C9sbPGzMHZ8AGB51BM0mok7davD/5irUk+f0C25OgzkwtxAt80dkDo
/QIDAQAB
-----END PUBLIC KEY-----`

function verifySignature(data: string, signature: string): boolean {
  try {
    const verify = crypto.createVerify('SHA256')
    verify.update(data)
    return verify.verify(DANA_PUBLIC_KEY, signature, 'base64')
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, status, signature } = body

    // Verify signature using DANA public key
    const dataToVerify = JSON.stringify({ paymentId, status })
    const isValidSignature = verifySignature(dataToVerify, signature)

    if (!isValidSignature) {
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Extract order ID from payment ID
    const orderId = parseInt(paymentId.replace('MDZ-', ''))

    // Update order status based on payment status
    let orderStatus: string
    let paymentStatus: string

    switch (status) {
      case 'SUCCESS':
        orderStatus = 'COMPLETED'
        paymentStatus = 'PAID'
        break
      case 'FAILED':
        orderStatus = 'FAILED'
        paymentStatus = 'FAILED'
        break
      case 'PENDING':
        orderStatus = 'PENDING'
        paymentStatus = 'PENDING'
        break
      default:
        orderStatus = 'PENDING'
        paymentStatus = 'PENDING'
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: orderStatus as any,
        paymentStatus,
        updatedAt: new Date(),
      },
    })

    // Send Telegram notification for payment status
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true },
      })

      if (order) {
        const message = `Payment Update!\nOrder ID: ${order.id}\nUser: ${order.user?.username || 'Guest'}\nAmount: ${order.amount} Robux\nPayment Status: ${paymentStatus}\nOrder Status: ${orderStatus}`
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
      }
    } catch (telegramError) {
      console.error('Telegram notification failed:', telegramError)
    }

    return NextResponse.json({
      message: 'Callback processed successfully',
    })
  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
