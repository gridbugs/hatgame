const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  return {
    entry: {
      game: path.resolve('.', 'src', 'client', 'game.tsx'),
      index: path.resolve('.', 'src', 'client', 'index.tsx'),
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
      alias: {
        'react': 'preact/compat',
        'react-dom': 'preact/compat',
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './static/container.html',
        filename: 'game.html',
        chunks: ['game'],
      }),
      new HtmlWebpackPlugin({
        template: './static/index.html',
        filename: 'index.html',
        chunks: ['index'],
      }),
      new ESLintPlugin({
        files: 'src/client/**',
        fix: true,
      }),
      new CopyPlugin({
        patterns: [
          { from: './static/favicon.ico' },
        ],
      }),
    ],
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/static/',
      filename: 'bundle.[name].js',
    },
  }
}
