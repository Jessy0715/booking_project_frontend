/*
覆寫 webpack 設定
https://ithelp.ithome.com.tw/m/articles/10293213

*/

const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = {
  webpack: override(
    addWebpackAlias({
      '@': path.resolve(__dirname, 'src'),
    })
  ),
  // 讓 jest 也能解析 '@/' 別名，並指向 RTK Query 的 CJS 版本（jest 27 不支援 exports 欄位）
  jest: (config) => {
    config.moduleNameMapper = {
      ...config.moduleNameMapper,
      '^@/(.*)$': '<rootDir>/src/$1',
      '^@reduxjs/toolkit/query/react$':
        '<rootDir>/node_modules/@reduxjs/toolkit/dist/query/react/cjs/index.js',
      '^@standard-schema/utils$':
        '<rootDir>/node_modules/@standard-schema/utils/dist/index.cjs',
    };
    return config;
  },
};
