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

    const existing = await prisma.monitorTask.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: '监测任务不存在' }, { status: 404 });
    }

    const task = await prisma.monitorTask.update({
      where: { id: params.id },
      data: {
        productId: body.productId,
        queryIds: body.queryIds,
        targetBrand: body.targetBrand,
        models: body.models,
        status: body.status,
        results: body.results,
        executedAt: body.executedAt ? new Date(body.executedAt) : null,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('更新监测任务失败:', error);
    return NextResponse.json({ error: '更新监测任务失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getTempUserId();

    const existing = await prisma.monitorTask.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: '监测任务不存在' }, { status: 404 });
    }

    await prisma.monitorTask.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除监测任务失败:', error);
    return NextResponse.json({ error: '删除监测任务失败' }, { status: 500 });
  }
}
