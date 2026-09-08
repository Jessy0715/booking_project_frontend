/*
覆寫 webpack 設定
https://ithelp.ithome.com.tw/m/articles/10293213

*/

const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = override(
  addWebpackAlias({
    '@': path.resolve(__dirname, 'src'),
  })
);