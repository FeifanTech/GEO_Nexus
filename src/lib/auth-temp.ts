/**
 * 临时用户认证工具
 *
 * 在 NextAuth.js 集成之前，使用本地存储的临时用户 ID
 * 未来将被真实的用户认证系统替换
 */

import { prisma } from '@/lib/prisma';

const TEMP_USER_ID_KEY = 'geo_nexus_temp_user_id';

/**
 * 获取或创建临时用户
 *
 * 在浏览器环境中从 localStorage 获取用户 ID
 * 在服务器环境中从 cookie 或创建新用户
 */
export async function getTempUserId(): Promise<string> {
  // 在服务器端，检查是否已有默认用户
  let user = await prisma.user.findFirst({
    where: { email: 'demo@geonexus.local' },
  });

  // 如果没有，创建一个默认演示用户
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'demo@geonexus.local',
        name: 'Demo User',
      },
    });
  }

  return user.id;
}

/**
 * 获取客户端临时用户 ID（用于前端）
 */
export function getClientTempUserId(): string {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side');
  }

  let userId = localStorage.getItem(TEMP_USER_ID_KEY);

  if (!userId) {
    userId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(TEMP_USER_ID_KEY, userId);
  }

  return userId;
}

/**
 * 清除临时用户数据（用于登出或切换用户）
 */
export function clearTempUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TEMP_USER_ID_KEY);
  }
}
