const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081,
    proxy: {
      '/api/remove-bg': {
        target: 'https://api.remove.bg',
        changeOrigin: true,
        secure: true,
        pathRewrite: {
          '^/api/remove-bg': ''
        },
        headers: {
          'X-Api-Key': process.env.VUE_APP_REMOVE_BG_API_KEY
        },
        onProxyReq: (proxyReq, req, res) => {
          // 添加 API 密钥到请求头
          if (process.env.VUE_APP_REMOVE_BG_API_KEY) {
            proxyReq.setHeader('X-Api-Key', process.env.VUE_APP_REMOVE_BG_API_KEY);
          }
        }
      }
    }
  }
})
