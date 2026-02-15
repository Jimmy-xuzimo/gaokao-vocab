module.exports = {
  apps: [{
    name: 'gaokao-vocab',
    script: '/usr/bin/npm',
    args: 'run preview -- --port 28001 --host 127.0.0.1',
    cwd: '/volume1/gaokao-vocab',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PATH: '/usr/bin:/usr/local/bin:/bin:/usr/sbin:/sbin'
    },
    error_file: '/volume1/gaokao-vocab/logs/err.log',
    out_file: '/volume1/gaokao-vocab/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // 自动重启配置
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 3000,
    // 优雅关闭
    kill_timeout: 5000,
    listen_timeout: 10000,
    // 健康检查
    health_check_grace_period: 30000,
  }]
};
