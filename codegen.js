/** @type {import('@rtk-query/codegen-openapi').ConfigFile} */
const config = {
  schemaFile: './openapi.yaml',
  apiFile: './src/services/emptyApi.ts',
  apiImportPath: './emptyApi',
  outputFile: './src/services/bookingApi.generated.ts',
  exportName: 'bookingApi',
  hooks: { queries: true, lazyQueries: true, mutations: true },
}

module.exports = config
