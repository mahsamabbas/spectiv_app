import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import engines from 'consolidate';
import path from 'path';
import compression from 'compression';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

// Authentication
import passport from 'passport';
import session from 'express-session';

import './config/passport';

import checkAuth from './lib/auth/checkAuth';
import routes from './routes';
import webpackConfig from './../webpack.config';

const RedisStore = require('connect-redis')(session);

const sessionStore = new RedisStore({
  url: process.env.REDDIS_CONNECTION_STRING,
});

const compiler = webpack(webpackConfig);
const middleware = webpackMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
  contentBase: 'src',
  stats: {
    colors: true,
    hash: false,
    timings: true,
    chunks: false,
    chunkModules: false,
    modules: false,
  },
});

const app = express();

const allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
};

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(allowCrossDomain);
app.use('/static', express.static(`${__dirname}/public`));
app.set('views', `${__dirname}/views`);
app.engine('html', engines.mustache);
app.set('view engine', 'html');

app.use(session({
  secret: process.env.PASSPORT_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.post('/authenticate', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error. Contact Support.',
      });
      // return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (!user) {
      return res.status(500).json({
        success: false,
        message: 'Username or password is invalid.',
      });
    }
    req.login(user, (err2) => {
      if (err2) {
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error. Contact Support.',
        });
        // return next(err2);
      }
      return res.status(200).json({
        success: true,
        message: 'You have successfully logged in!',
        route: '/',
      });
    });
  })(req, res, next);
});

// Route Middleware
app.use('/', routes);

// Configure webpack hot-middleware and configure for production
const isDeveloping = process.env.NODE_ENV !== 'production';
if (isDeveloping) {
  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('*', (req, res) => {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, '../dist/index.html')));
    res.end();
  });
} else {
// Middleware - In production, force client to use HTTPS via redirect
  app.use(function(req, res, next) {
    if((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
      res.redirect('https://' + req.get('Host') + req.url);
        }
    else
    next();
  });

  app.use(compression());
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

export default app;
