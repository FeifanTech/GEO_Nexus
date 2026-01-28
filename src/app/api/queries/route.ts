import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTempUserId } from '@/lib/auth-temp';

export async function GET() {
  try {
    const userId = await getTempUserId();
    const queries = await prisma.searchQuery.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(queries);
  } catch (error) {
    console.error('获取问题列表失败:', error);
    return NextResponse.json({ error: '获取问题列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getTempUserId();
    const body = await request.json();

    const query = await prisma.searchQuery.create({
      data: {
        userId,
        question: body.question,
        intent: body.intent,
        category: body.category,
        tags: body.tags || [],
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    });

    return NextResponse.json(query, { status: 201 });
  } catch (error) {
    console.error('创建问题失败:', error);
    return NextResponse.json({ error: '创建问题失败' }, { status: 500 });
  }
}
