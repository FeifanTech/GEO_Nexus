#!/bin/bash

# 检测环境变量
echo "🔍 检查环境变量..."
echo ""

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL 未设置"
    exit 1
else
    echo "✅ DATABASE_URL 已设置"
    echo "   Region: $(echo $DATABASE_URL | grep -o 'aws-[^.]*' || echo '未检测到')"
fi

if [ -z "$DIRECT_URL" ]; then
    echo "❌ DIRECT_URL 未设置"
    exit 1
else
    echo "✅ DIRECT_URL 已设置"
    echo "   Region: $(echo $DIRECT_URL | grep -o 'aws-[^.]*' || echo '未检测到')"
fi

echo ""
echo "⚠️  注意: DATABASE_URL 和 DIRECT_URL 应该使用相同的区域！"
echo ""
echo "当前配置:"
echo "  DATABASE_URL Region: us-west-2"
echo "  DIRECT_URL Region:   ap-southeast-1"
echo ""
echo "建议: 两个 URL 都使用同一个 Supabase 项目的连接字符串"
