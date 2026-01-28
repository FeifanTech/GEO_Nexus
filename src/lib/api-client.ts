/**
 * API 客户端工具
 *
 * 提供统一的 API 调用方法，包含错误处理和类型安全
 */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiCall<T>(url: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '请求失败' }));
      throw new ApiError(response.status, error.error || error.message || '请求失败');
    }

    // DELETE 请求可能返回空响应
    if (method === 'DELETE') {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('网络请求失败');
  }
}

// 导出便捷方法
export const api = {
  get: <T>(url: string) => apiCall<T>(url, { method: 'GET' }),
  post: <T>(url: string, body?: unknown) => apiCall<T>(url, { method: 'POST', body }),
  put: <T>(url: string, body?: unknown) => apiCall<T>(url, { method: 'PUT', body }),
  delete: <T>(url: string) => apiCall<T>(url, { method: 'DELETE' }),
};

export { ApiError };
