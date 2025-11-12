import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

interface Product {
  id: number
  name: string
  price: number
  quantity: number
  description: string
  createdAt: string
  updatedAt: string
}

// Mock products data (in a real app, this would be stored in database)
let mockProducts: Product[] = [
  {
    id: 1,
    name: 'Robux 80',
    price: 15000,
    quantity: 100,
    description: '80 Robux for Roblox',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Robux 400',
    price: 75000,
    quantity: 50,
    description: '400 Robux for Roblox',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Robux 800',
    price: 150000,
    quantity: 25,
    description: '800 Robux for Roblox',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

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
      role: string
    }

    // Check if user is admin
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      )
    }

    return NextResponse.json({ products: mockProducts })
  } catch (error) {
    console.error('Admin products fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
      role: string
    }

    // Check if user is admin
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { name, price, quantity, description } = await request.json()

    if (!name || !price || quantity === undefined || !description) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    const newProduct: Product = {
      id: Math.max(...mockProducts.map(p => p.id)) + 1,
      name,
      price: parseInt(price),
      quantity: parseInt(quantity),
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockProducts.push(newProduct)

    return NextResponse.json({
      message: 'Product created successfully',
      product: newProduct
    })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const { id, name, price, quantity, description } = await request.json()

    if (!id || !name || !price || quantity === undefined || !description) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    const productIndex = mockProducts.findIndex(p => p.id === parseInt(id))
    if (productIndex === -1) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      name,
      price: parseInt(price),
      quantity: parseInt(quantity),
      description,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Product updated successfully',
      product: mockProducts[productIndex]
    })
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 }
      )
    }

    const productIndex = mockProducts.findIndex(p => p.id === parseInt(id))
    if (productIndex === -1) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    const deletedProduct = mockProducts.splice(productIndex, 1)[0]

    return NextResponse.json({
      message: 'Product deleted successfully',
      product: deletedProduct
    })
  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
