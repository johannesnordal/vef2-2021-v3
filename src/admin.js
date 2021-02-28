import express from 'express';
import { catchErrors, form } from './utils.js';
import { loginRouter, logoutRouter } from './login.js';

export const router = express.Router();

router.use('/login', loginRouter);
router.use('/logout', logoutRouter);

export async function admin(req, res) {
  const { 
    errors,
    formData,
    result,
    loggedin,
  } = await form(req, res);

  res.render('admin', {
    errors, formData, result, loggedin,
  });
}

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/admin/login');
}

router.get('/', ensureLoggedIn, catchErrors(admin));
