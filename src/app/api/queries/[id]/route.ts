import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTempUserId } from '@/lib/auth-temp';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getTempUserId();
    const body = await request.json();

    const existing = await prisma.searchQuery.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: '问题不存在' }, { status: 404 });
    }

    const query = await prisma.searchQuery.update({
      where: { id: params.id },
      data: {
        question: body.question,
        intent: body.intent,
        category: body.category,
        tags: body.tags,
        isActive: body.isActive,
      },
    });

    return NextResponse.json(query);
  } catch (error) {
    console.error('更新问题失败:', error);
    return NextResponse.json({ error: '更新问题失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getTempUserId();

    const existing = await prisma.searchQuery.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: '问题不存在' }, { status: 404 });
    }

    await prisma.searchQuery.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除问题失败:', error);
    return NextResponse.json({ error: '删除问题失败' }, { status: 500 });
  }
}
