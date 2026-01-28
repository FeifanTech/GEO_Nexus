import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTempUserId } from '@/lib/auth-temp';

export async function GET() {
  try {
    const userId = await getTempUserId();
    const tasks = await prisma.monitorTask.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('获取监测任务列表失败:', error);
    return NextResponse.json({ error: '获取监测任务列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getTempUserId();
    const body = await request.json();

    const task = await prisma.monitorTask.create({
      data: {
        userId,
        productId: body.productId,
        queryIds: body.queryIds || [],
        targetBrand: body.targetBrand,
        models: body.models || [],
        status: body.status || 'pending',
        results: body.results || [],
        executedAt: body.executedAt ? new Date(body.executedAt) : null,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('创建监测任务失败:', error);
    return NextResponse.json({ error: '创建监测任务失败' }, { status: 500 });
  }
}
