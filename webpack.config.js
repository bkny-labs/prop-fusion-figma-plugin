const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');

const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',
  devtool: argv.mode === 'production' ? false : 'inline-source-map',
  entry: {
    ui: './src/app/index.tsx',
    code: './src/plugin/controller.ts',
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.css$/, use: ['style-loader', { loader: 'css-loader' }] },
      { test: /\.(png|jpg|gif|webp|svg)$/, loader: 'url-loader' },

      // {
      //   test: /\.(png|jpg|jpeg|gif|svg)$/i,
      //   type: 'asset/resource',
      //   generator: {
      //     filename: 'src/app/assets/[name][ext]'
      //   }
      // }
    ],
  },

  resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js'] },

  output: {
    filename: '[name].js',
    publicPath: './',
    path: path.resolve(__dirname, 'dist'), 
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/app/index.html',
      filename: 'ui.html',
      chunks: ['ui'],
      cache: false,
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/ui/]),
    new Dotenv()
  ],
});
