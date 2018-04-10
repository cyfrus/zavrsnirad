module.exports = {
  entry: {
    app: "./public/javascripts/app.js"
    },
  output: {
      path: __dirname + "/public",
      filename: "[name].js"
  },
  module: {
      rules: [
          {
              test: /\.js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                  loader: 'babel-loader',
                  options: {
                      presets: ['react']
                  }
              }
          }
      ]
  },
  watch: true
}