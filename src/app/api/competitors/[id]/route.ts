import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTempUserId } from '@/lib/auth-temp';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getTempUserId();
    const competitor = await prisma.competitor.findFirst({
      where: { id: params.id, userId },
    });

    if (!competitor) {
      return NextResponse.json({ error: '竞品不存在' }, { status: 404 });
    }

    return NextResponse.json(competitor);
  } catch (error) {
    console.error('获取竞品失败:', error);
    return NextResponse.json({ error: '获取竞品失败' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getTempUserId();
    const body = await request.json();

    const existing = await prisma.competitor.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: '竞品不存在' }, { status: 404 });
    }

    const competitor = await prisma.competitor.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        advantages: body.advantages,
        disadvantages: body.disadvantages,
        channels: body.channels,
      },
    });

    return NextResponse.json(competitor);
  } catch (error) {
    console.error('更新竞品失败:', error);
    return NextResponse.json({ error: '更新竞品失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getTempUserId();

    const existing = await prisma.competitor.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: '竞品不存在' }, { status: 404 });
    }

    await prisma.competitor.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除竞品失败:', error);
    return NextResponse.json({ error: '删除竞品失败' }, { status: 500 });
  }
}
