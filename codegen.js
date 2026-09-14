/** @type {import('@rtk-query/codegen-openapi').ConfigFile} */
const config = {
  schemaFile: 'http://localhost:8088/v3/api-docs',
  apiFile: './src/services/emptyApi.ts',
  apiImportPath: './emptyApi',
  outputFile: './src/services/bookingApi.generated.ts',
  exportName: 'bookingApi',
  hooks: { queries: true, lazyQueries: true, mutations: true },
}

module.exports = config
