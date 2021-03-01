import express from 'express';
import { deleteSignature } from './db.js';
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

export async function adminDeleteSignature(req, res) {
  await deleteSignature(req.params.id);
  return res.redirect('/admin');
}

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/admin/login');
}

router.get('/', ensureLoggedIn, catchErrors(admin));
router.post('/delete/:id', ensureLoggedIn, catchErrors(adminDeleteSignature));
