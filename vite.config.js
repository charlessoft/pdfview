import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import topLevelAwait from 'vite-plugin-top-level-await'
import path from "path";
import fs from "fs";
import * as dotenv from 'dotenv'

const NODE_ENV = process.env.NODE_ENV || 'development'
const envFiles = [
  `.env.${NODE_ENV}`
]
for (const file of envFiles) {
  const envConfig = dotenv.parse(fs.readFileSync(file))
  for (const k in envConfig) {
    process.env[k] = envConfig[k]
  }
}

const alias = {
  '@': path.resolve(__dirname, './src'),
  'vue$': 'vue/dist/vue.runtime.esm-bundler.js',
}

console.log('========')
console.log(process.env.VITE_BASE_API)
console.log('========')
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias,
  },
  plugins: [vue(),topLevelAwait({promiseExportName: '__tla', promiseImportName: (i) => `__tla_${i}`})],
  server: {
    // 如果使用docker-compose开发模式，设置为false
    open: true,
    port: process.env.VITE_CLI_PORT,
    proxy: {
      // 把key的路径代理到target位置
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      [process.env.VITE_BASE_API]: { // 需要代理的路径   例如 '/api'
        target: `${process.env.VITE_BASE_PATH}:${process.env.VITE_SERVER_PORT}/api/v1`, // 代理到 目标路径
        changeOrigin: true,
        rewrite: path => {
          const newPath = path.replace(new RegExp('^' + process.env.VITE_BASE_API), '');
          console.log('baseurl',`${process.env.VITE_BASE_PATH}:${process.env.VITE_SERVER_PORT}/`);  // 输出新路径
          return newPath;
        },
      },
    },
  },
})

