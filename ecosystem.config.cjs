module.exports = {
  apps: [
    {
      name: "packslip-api",
      cwd: "apps/api",
      script: "src/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      },
      max_memory_restart: "512M"
    }
  ]
};
