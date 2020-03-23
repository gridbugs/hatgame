const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  return {
    entry: {
      main: path.resolve('.', 'src', 'client', 'index.tsx'),
    },
    devtool: argv.mode === 'production' ? 'false' : 'inline-source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: [ /node_modules/ ],
          loader: 'ts-loader',
          options: {
            configFile: "tsconfig.client.json",
          },
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'eslint-loader',
        }
      ],
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './static/index.html',
        filename: 'index.html',
      }),
      new HtmlWebpackPlugin({
        template: './static/game.html',
        filename: 'game.html',
      }),
    ],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
    },
  }
}
