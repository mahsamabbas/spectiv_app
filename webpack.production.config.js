const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'inline-source-map',
  entry: [
    path.join(__dirname, 'client/main.js'),
  ],
  output: {
    path: path.join(__dirname, '/dist'),
    filename: '[name]-[hash].min.js',
    publicPath: '/',
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new HtmlWebpackPlugin({
      template: 'client/production.tpl.html',
      inject: 'body',
      filename: 'index.html',
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
        screw_ie8: true,
      },
    }),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify('production'),
      DEBUG: JSON.stringify(process.env.DEBUG),
      AWS_VIDEO_CDN: JSON.stringify(process.env.AWS_VIDEO_CDN),
    }),
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['react', 'es2015'],
      },
    },
    {
      test: /\.s?css$/,
      loaders: ['style', 'css', 'sass'],
      include: path.join(__dirname, 'client'),
      exclude: /node_modules/,
    }],
  },
};
