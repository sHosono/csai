import colors from 'vuetify/es5/util/colors'
import fs from 'fs'
import path from 'path'
const logStream = fs.createWriteStream('proxy.log', { flags: 'a' });

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - test',
    title: 'test',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [
      { src: 'https://imasdk.googleapis.com/js/sdkloader/ima3.js', async: true }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/proxy',
  ],

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },
  server: {
//    host: '192.168.11.56', // 任意のIPアドレスでアクセス可能にする
//    port: 3000,       // 必要に応じてポート番号も指定
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'server/ssl/server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'server/ssl/server.crt')),
    },
  },
  serverMiddleware: [
    '~/server-middleware/cors.js', // CORSミドルウェアを登録
  ],
  proxy: {
    '/vmap/': {
      target: 'https://localhost:3000',
      pathRewrite: { '^/vmap/': '/videos/' },
      changeOrigin: true,
      secure: false,
      onProxyReq(proxyReq, req, res) {
        console.log(`[PROXY] Original URL: ${req.url}`);
        console.log(`[PROXY] Rewritten Path: ${proxyReq.path}`);
      },
      onProxyRes(proxyRes, req, res) {
        console.log(`[PROXY] Response Status: ${proxyRes.statusCode}`);
      },
    },
  },
  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
