const nodeExternals = require('webpack-node-externals');
const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = (env, argv) => {
  return {
    target: 'node',
    node: {
      __dirname: false,
      __filename: false,
    },
    entry: {
      main: path.resolve('.', 'src', 'server', 'app.ts'),
    },
    devtool: argv.mode === 'production' ? 'false' : 'inline-source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: [ /node_modules/ ],
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.server.json',
          },
        },
      ],
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
    plugins: [
      new ESLintPlugin({
        files: 'src/server/**',
        fix: true,
      }),
    ],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'app.js',
    },
    externals: [
      nodeExternals(),
    ],
  }
}
