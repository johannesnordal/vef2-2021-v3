import express from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';
import passport from 'passport';
import { Strategy } from 'passport-local';
import { comparePasswords, findByUsername, findById } from './users.js';
import { catchErrors } from './utils.js';

export default passport;

export const loginRouter = express.Router();
export const logoutRouter = express.Router();

const validationMiddleware = [
  body('username')
    .isLength({ min: 1 })
    .withMessage('Vantar notandanafn'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Vantar lykilorð'),
];

const xssSanitizationMiddleware = [
  body('username').customSanitizer((v) => xss(v)),
  body('password').customSanitizer((v) => xss(v)),
];

const sanitizationMiddleware = [
  body('name').trim().escape(),
  body('password').trim().escape(),
];

async function validationCheck(req, res, next) {
  const {
    username,
    password,
  } = req.body;

  const loginData = {
    username,
    password,
  };

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    return res.render('login', { loginData, errors: validation.errors, message: '' });
  }

  return next();
}

async function strat(username, password, done) {
  try {
    const user = await findByUsername(username);

    if (!user) {
      return done(null, false);
    }

    const result = await comparePasswords(password, user);
    return done(null, result);
  } catch (err) {
    console.error(err);
    return done(err);
  }
}

passport.use(new Strategy(strat));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (username, done) => {
  try {
    const user = await findById(username);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

loginRouter.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/admin');
  }

  let message = '';

  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  const loginData = {
    username: '',
    password: '',
  };

  return res.render('login', { loginData, errors: [], message });
});

loginRouter.post('/',
  validationMiddleware,
  xssSanitizationMiddleware,
  catchErrors(validationCheck),
  sanitizationMiddleware,
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/admin/login',
  }),
  (req, res) => {
    res.redirect('/admin');
  });

logoutRouter.get('/', (req, res) => {
  req.logout();
  res.redirect('/');
});
