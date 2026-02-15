#!/bin/bash

# Gaokao Vocab Master 启动脚本
# 用于检查并启动服务

echo "=========================================="
echo "  Gaokao Vocab Master 服务管理脚本"
echo "=========================================="
echo ""

# 检查进程是否在运行
check_process() {
    if pgrep -f "vite preview.*28001" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# 启动服务
start_service() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 正在启动服务..."
    cd /volume1/gaokao-vocab || exit 1
    
    # 创建日志目录
    mkdir -p logs
    
    # 使用 nohup 后台运行
    nohup npm run preview -- --port 28001 --host 127.0.0.1 > logs/out.log 2> logs/err.log &
    
    # 等待服务启动
    sleep 3
    
    if check_process; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 服务启动成功！"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 访问地址: http://127.0.0.1:28001"
        return 0
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 服务启动失败！"
        return 1
    fi
}

# 停止服务
stop_service() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 正在停止服务..."
    pkill -f "vite preview.*28001"
    sleep 2
    
    if check_process; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ 服务未能完全停止，强制终止..."
        pkill -9 -f "vite preview.*28001"
    fi
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 服务已停止"
}

# 查看状态
status_service() {
    if check_process; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 服务运行正常"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 进程信息:"
        pgrep -f "vite preview.*28001" -a
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 服务未运行"
    fi
}

# 重启服务
restart_service() {
    stop_service
    sleep 2
    start_service
}

# 主逻辑
case "${1:-start}" in
    start)
        if check_process; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️ 服务已经在运行中"
            status_service
        else
            start_service
        fi
        ;;
    stop)
        stop_service
        ;;
    restart)
        restart_service
        ;;
    status)
        status_service
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status}"
        echo ""
        echo "命令说明:"
        echo "  start   - 启动服务（如果未运行）"
        echo "  stop    - 停止服务"
        echo "  restart - 重启服务"
        echo "  status  - 查看服务状态"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
