import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTempUserId } from '@/lib/auth-temp';

// GET /api/competitors
export async function GET() {
  try {
    const userId = await getTempUserId();

    const competitors = await prisma.competitor.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(competitors);
  } catch (error) {
    console.error('获取竞品列表失败:', error);
    return NextResponse.json({ error: '获取竞品列表失败' }, { status: 500 });
  }
}

// POST /api/competitors
export async function POST(request: NextRequest) {
  try {
    const userId = await getTempUserId();
    const body = await request.json();

    const competitor = await prisma.competitor.create({
      data: {
        userId,
        name: body.name,
        description: body.description,
        advantages: body.advantages || [],
        disadvantages: body.disadvantages || [],
        channels: body.channels || [],
      },
    });

    return NextResponse.json(competitor, { status: 201 });
  } catch (error) {
    console.error('创建竞品失败:', error);
    return NextResponse.json({ error: '创建竞品失败' }, { status: 500 });
  }
}
