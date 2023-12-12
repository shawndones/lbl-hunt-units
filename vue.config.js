const { defineConfig } = require('@vue/cli-service')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      fallback: {
        url: require.resolve('url/'),
        zlib: require.resolve('browserify-zlib'),
        https: require.resolve('https-browserify'),
        http: require.resolve('stream-http'),
        assert: require.resolve('assert/'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util/')
      }
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: path.join(__dirname, 'node_modules/cesium/Build/Cesium/Workers'), to: 'Workers' },
          { from: path.join(__dirname, 'node_modules/cesium/Build/Cesium/ThirdParty'), to: 'ThirdParty' },
          { from: path.join(__dirname, 'node_modules/cesium/Build/Cesium/Assets'), to: 'Assets' },
          { from: path.join(__dirname, 'node_modules/cesium/Build/Cesium/Widgets'), to: 'Widgets' }
        ]
      })
    ]
  },

})
