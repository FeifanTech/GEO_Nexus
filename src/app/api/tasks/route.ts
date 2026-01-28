import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTempUserId } from '@/lib/auth-temp';

export async function GET() {
  try {
    const userId = await getTempUserId();
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('获取任务列表失败:', error);
    return NextResponse.json({ error: '获取任务列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getTempUserId();
    const body = await request.json();

    const task = await prisma.task.create({
      data: {
        userId,
        title: body.title,
        description: body.description,
        productId: body.productId,
        type: body.type,
        status: body.status || 'todo',
        priority: body.priority || 'medium',
        checklist: body.checklist || [],
        assignee: body.assignee,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('创建任务失败:', error);
    return NextResponse.json({ error: '创建任务失败' }, { status: 500 });
  }
}
