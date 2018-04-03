import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
  devtool: 'source-map',
  entry: [

    // 'webpack-dev-server/client?http://localhost:1337',
    // 'webpack/hot/dev-server',
    // './client/main.js'
    // 'webpack-hot-middleware/client?path=/__webpack_hmr',
    // path.join(__dirname, 'client/main.js'),
    //'react-hot-loader/patch',
    'webpack-hot-middleware/client?reload=true/__webpack_hmr',
    path.join(__dirname, 'client/main.js'),
    
  ],
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: 'main.js',
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'client/index.tpl.html',
      inject: 'body',
      filename: 'index.html',
    }),
    //new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    //new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify('dev'),
      DEBUG: JSON.stringify(process.env.DEBUG),
      AWS_VIDEO_CDN: JSON.stringify(process.env.AWS_VIDEO_CDN),
    }),
  ],
  // resolve: {
  //   extensions: ['', '.js', '.json'],
  // },
  module: {
    // loaders: [
    //   {
    //     test: /\.jsx?$/,
    //     exclude: /node_modules/,
    //     loader: 'babel-loader',
    //     query: {
    //       presets: ['react', 'es2015'],
    //     },
    //   },
    //   {
    //     test: /\.scss$/,
    //     loaders: ['style', 'css', 'sass'],
    //     include: path.join(__dirname, 'client'),
    //     exclude: /node_modules/,
    //   },
    //   {
    //     test: /\.css$/,
    //     loaders: ['style', 'css'],
    //   },
    // ],
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['react-hot-loader/webpack','babel-loader'],
        
      },
      {
        test: /\.scss$/,exclude: /node_modules/,
        include: path.join(__dirname, 'client'),
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
