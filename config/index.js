// see http://vuejs-templates.github.io/webpack for documentation.
const path = require('path')
const fs = require('fs');
let pages = [], js = [];
let outputDir="../safari2aria.safariextension";
fs.readdirSync(path.resolve(__dirname, '../src/pages')).forEach(file => {
  pages.push({
    name: file,
    entry: `./src/pages/${file}/index.js`,
    filename: path.resolve(__dirname, `${outputDir}/${file}.html`)
  })
});

fs.readdirSync(path.resolve(__dirname, '../src/js')).forEach(file => {
  js.push({
    name: file,
    entry: `./src/js/${file}/index.js`
  })
});
module.exports = {
  build: {
    env: require('./prod.env'),
    pages,
    js,
    vendorExclusive:['mini-toastr','pageScriptMessage','runInPage'],
    assetsRoot: path.resolve(__dirname, `${outputDir}`),
    assetsSubDirectory: 'static',
    assetsPublicPath: '',
    productionSourceMap: false,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    env: require('./dev.env'),
    port: 8080,
    autoOpenBrowser: false,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {},
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  }
}
