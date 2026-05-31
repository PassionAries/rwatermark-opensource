const { name } = require('./package.json');
const path = require('path');

module.exports = {
  apps: [
    {
      name: name,
      script: path.resolve(
        __dirname,
        './dist/main.js',
      ),
      instances: 1,
      autorestart: true,
      watch: false,
      error_file: './pm2logs/rwatermark-server/pm2-app-err.log',
      out_file: './pm2logs/rwatermark-server/pm2-app-out.log',
      merge_logs: true, // 设置追加日志而不是新建日志
      log_date_format: 'YYYY-MM-DD HH:mm:ss', // 指定日志文件的时间格式
      min_uptime: '60s', // 应用运行少于时间被认为是异常启动
      max_restarts: 30, // 最大异常重启次数
      restart_delay: 60, // 异常重启情况下，延时重启时间
      ignore_watch: [
        'node_modules',
        'public',
        'logs',
        'pm2logs',
        'src',
        'ecosystem.config.js',
        'dist',
      ], // 不用监听的文件
      env: {
        NODE_ENV: 'prod',
      },
    },
    
  ],
};
