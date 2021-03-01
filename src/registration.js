import express from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';
import { insert } from './db.js';
import { catchErrors, form } from './utils.js';

export const router = express.Router();

async function index(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/admin');
  }

  const {
    errors,
    formData,
    result,
  } = await form(req, res);

  return res.render('index', {
    errors, formData, result, loggedin: req.isAuthenticated(),
  });
}

const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';

const validationMiddleware = [
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  body('name')
    .isLength({ max: 128 })
    .withMessage('Nafn má að hámarki vera 128 stafir'),
  body('nationalId')
    .isLength({ min: 1 })
    .withMessage('Kennitala má ekki vera tóm'),
  body('nationalId')
    .matches(new RegExp(nationalIdPattern))
    .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),
  body('comment')
    .isLength({ max: 400 })
    .withMessage('Athugasemd má að hámarki vera 400 stafir'),
];

const xssSanitizationMiddleware = [
  body('name').customSanitizer((v) => xss(v)),
  body('nationalId').customSanitizer((v) => xss(v)),
  body('comment').customSanitizer((v) => xss(v)),
  body('anonymous').customSanitizer((v) => xss(v)),
];

const sanitizationMiddleware = [
  body('name').trim().escape(),
  body('nationalId').blacklist('-'),
];

async function validationCheck(req, res, next) {
  const {
    name, nationalId, comment, anonymous,
  } = req.body;

  const formData = {
    name, nationalId, comment, anonymous,
  };

  const { result } = await form(req, res);

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    return res.render('index', { formData, errors: validation.errors, result });
  }

  return next();
}

async function register(req, res) {
  const {
    name, nationalId, comment, anonymous,
  } = req.body;

  let success = true;

  const signed = new Date();
  try {
    success = await insert({
      name, nationalId, comment, anonymous, signed,
    });
  } catch (e) {
    console.error(e);
  }

  if (success) {
    return res.redirect('/');
  }

  return res.render('error', { title: 'Gat ekki skráð!', text: 'Hafðir þú skrifað undir áður?' });
}

router.get('/', catchErrors(index));

router.post(
  '/',
  validationMiddleware,
  xssSanitizationMiddleware,
  catchErrors(validationCheck),
  sanitizationMiddleware,
  catchErrors(register),
);
