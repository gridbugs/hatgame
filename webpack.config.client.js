const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  return {
    entry: {
      game: path.resolve('.', 'src', 'client', 'game.tsx'),
      index: path.resolve('.', 'src', 'client', 'index.ts'),
    },
    devtool: argv.mode === 'production' ? 'false' : 'inline-source-map',
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.tsx?$/,
          exclude: [ /node_modules/ ],
          loader: 'eslint-loader',
        },
        {
          test: /\.tsx?$/,
          exclude: [ /node_modules/ ],
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.client.json',
          },
        },
      ],
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './static/index.html',
        filename: 'index.html',
        chunks: ['index'],
      }),
      new HtmlWebpackPlugin({
        template: './static/game.html',
        filename: 'game.html',
        chunks: [ 'game' ],
      }),
    ],
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/static/',
      filename: 'bundle.[name].js',
    },
  }
}
