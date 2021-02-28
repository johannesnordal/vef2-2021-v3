import express from 'express';
import passport from 'passport';
import { Strategy } from 'passport-local';
import { comparePasswords, findByUsername, findById } from './users.js';

export default passport;

export const loginRouter = express.Router();
export const logoutRouter = express.Router();

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
  return res.render('login');
});

loginRouter.post('/',
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/admin/login',
  }),
  (req, res) => {
    res.redirect('/admin');
  },
);

logoutRouter.get('/', (req, res) => {
  req.logout();
  res.redirect('/');
});

