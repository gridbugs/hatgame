const nodeExternals = require('webpack-node-externals');
const path = require('path');

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
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'app.js',
    },
    externals: [
      nodeExternals(),
    ],
  }
}
