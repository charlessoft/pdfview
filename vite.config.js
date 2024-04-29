import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import topLevelAwait from 'vite-plugin-top-level-await'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),topLevelAwait({promiseExportName: '__tla', promiseImportName: (i) => `__tla_${i}`})],
  server: {
    // 如果使用docker-compose开发模式，设置为false
    open: true,
    port: process.env.VITE_CLI_PORT,
    proxy: {
      // 把key的路径代理到target位置
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      [process.env.VITE_BASE_API]: { // 需要代理的路径   例如 '/api'
        target: `${process.env.VITE_BASE_PATH}:${process.env.VITE_SERVER_PORT}/`, // 代理到 目标路径
        changeOrigin: true,
        rewrite: path => {
          const newPath = path.replace(new RegExp('^' + process.env.VITE_BASE_API), '');
          console.log(newPath);  // 输出新路径
          return newPath;
        },
      },
    },
  },
})

