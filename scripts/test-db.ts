/**
 * Supabase 数据库连接测试脚本
 *
 * 运行方式:
 * 1. 确保已配置 .env.local
 * 2. 运行: npx tsx scripts/test-db.ts
 */

import { prisma } from '../src/lib/prisma';

async function testConnection() {
  console.log('🔍 测试 Supabase 数据库连接...\n');

  try {
    // 测试 1: 检查数据库版本
    console.log('📊 测试 1: 检查 PostgreSQL 版本');
    const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
    console.log('✅ 连接成功!');
    console.log(`   版本: ${result[0].version.split(' ').slice(0, 2).join(' ')}\n`);

    // 测试 2: 检查所有表是否存在
    console.log('📊 测试 2: 检查数据表');
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    console.log(`✅ 找到 ${tables.length} 个数据表:`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.tablename}`);
    });
    console.log('');

    // 测试 3: 统计各表数据量
    console.log('📊 测试 3: 统计数据量');
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.competitor.count(),
      prisma.task.count(),
      prisma.searchQuery.count(),
      prisma.monitorTask.count(),
    ]);

    const stats = [
      { name: 'User', count: counts[0] },
      { name: 'Product', count: counts[1] },
      { name: 'Competitor', count: counts[2] },
      { name: 'Task', count: counts[3] },
      { name: 'SearchQuery', count: counts[4] },
      { name: 'MonitorTask', count: counts[5] },
    ];

    console.log('✅ 数据统计:');
    stats.forEach(({ name, count }) => {
      console.log(`   ${name.padEnd(15)}: ${count} 条记录`);
    });
    console.log('');

    // 测试 4: 测试写入操作
    console.log('📊 测试 4: 测试写入操作');
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });
    console.log('✅ 创建测试用户成功');
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Email: ${testUser.email}\n`);

    // 清理测试数据
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log('🧹 测试数据已清理\n');

    console.log('🎉 所有测试通过! Supabase 数据库配置成功!\n');
    console.log('下一步:');
    console.log('  1. 运行 npm run db:studio 打开数据库管理界面');
    console.log('  2. 开始集成 NextAuth.js 认证系统');
    console.log('  3. 创建 API 端点\n');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('\n请检查:');
    console.error('  1. .env.local 文件是否正确配置');
    console.error('  2. DATABASE_URL 和 DIRECT_URL 是否正确');
    console.error('  3. Supabase 项目是否已创建');
    console.error('  4. 是否已运行 npm run db:migrate');
    console.error('\n详细配置步骤请查看: SUPABASE_SETUP.md\n');
    process.exit(1);
  }
}

async function main() {
  try {
    await testConnection();
  } finally {
    await prisma.$disconnect();
  }
}

main();
