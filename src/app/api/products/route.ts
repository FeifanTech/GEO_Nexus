import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTempUserId } from '@/lib/auth-temp';

// GET /api/products - 获取所有产品
export async function GET() {
  try {
    const userId = await getTempUserId();

    const products = await prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('获取产品列表失败:', error);
    return NextResponse.json(
      { error: '获取产品列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/products - 创建新产品
export async function POST(request: NextRequest) {
  try {
    const userId = await getTempUserId();
    const body = await request.json();

    const product = await prisma.product.create({
      data: {
        userId,
        name: body.name,
        category: body.category,
        description: body.description,
        sellingPoints: body.sellingPoints || [],
        targetUsers: body.targetUsers,
        priceRange: body.priceRange,
        competitorIds: body.competitorIds || [],
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('创建产品失败:', error);
    return NextResponse.json(
      { error: '创建产品失败' },
      { status: 500 }
    );
  }
}
