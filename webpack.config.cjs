const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src'),
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      assert: require.resolve('assert/'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'), // required for crypto-browserify
      constants: require.resolve('constants-browserify'),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'iexec-private-data-protector',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
};
