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

    const existing = await prisma.task.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        productId: body.productId,
        type: body.type,
        status: body.status,
        priority: body.priority,
        checklist: body.checklist,
        assignee: body.assignee,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('更新任务失败:', error);
    return NextResponse.json({ error: '更新任务失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getTempUserId();

    const existing = await prisma.task.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除任务失败:', error);
    return NextResponse.json({ error: '删除任务失败' }, { status: 500 });
  }
}
