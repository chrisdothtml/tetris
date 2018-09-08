export default {
  mode: 'development',
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  performance: {
    hints: false
  },
  resolve: {
    alias: {
      // to avoid runtime error `require is undefined`
      ractive: require.resolve('ractive')
    }
  }
}
