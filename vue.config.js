const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    publicPath: process.env.NODE_ENV === 'production'
        ? '/glyph_experiment/'
        : '/',
    devServer: {
        proxy: {
            // 请求前缀
            '/glyph_experiment': {
                target: 'https://leisir16.github.io',
                pathRewrite: {'^/glyph_experiment': ''},
                // 用于支持websocket 默认为true
                ws: true,
                // 代理服务器不会如实说自己的地址 默认为true 控制请求头种host值
                changeOrigin: true
            }
        }
    }
})
