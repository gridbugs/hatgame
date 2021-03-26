const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = (env, argv) => {
  return {
    entry: {
      game: path.resolve('.', 'src', 'client', 'game.tsx'),
    },
    devtool: argv.mode === 'production' ? 'false' : 'inline-source-map',
    module: {
      rules: [
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
        template: './static/game.html',
        filename: 'game.html',
        chunks: ['game'],
      }),
      new ESLintPlugin({
        files: 'src/client/**',
        fix: true,
      }),
    ],
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/static/',
      filename: 'bundle.[name].js',
    },
  }
}
