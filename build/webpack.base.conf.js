var path = require('path')
var utils = require('./utils')

var projectRoot = path.resolve(__dirname, '../')
const vuxLoader = require('vux-loader')

var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

let webpackConfig = {
  entry: {
    //popover: './src/pages/popover/index.js'
  },
  output: {
    path: config.build.assetsRoot,
    filename: 'js/[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      '!': resolve('static')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'),resolve('node_modules/vue-echarts')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loaders: [
          {
            loader: path.resolve(__dirname, 'cssPathResolver')
          },
          {
            loader: 'url-loader',
            query: {
              limit: 10000,
              name: utils.assetsPath('icons/[name].[hash:7].[ext]'),
            }
          }
        ]
      }
    ]
  }
}
if(config.build.pages){
  config.build.pages.forEach(function (page) {
    webpackConfig.entry[page.name]=page.entry;
  })
}

module.exports = vuxLoader.merge(webpackConfig, {
  plugins: ['vux-ui', 'progress-bar', 'duplicate-style']
})
