import { list, countSignatures } from './db.js';

export function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// eslint-disable-next-line no-unused-vars
export async function form(req, res) {
  let { page = 1 } = req.query;
  page = Number(page);

  const limit = 50;
  const offset = (page - 1) * limit;

  const { count } = await countSignatures();
  const registrations = await list(offset, limit);

  const numberOfPages = Math.ceil(count / limit);

  const result = {
    _links: {
      self: {
        href: `${req.baseUrl}/?page=${page}`,
      },
    },
    items: registrations,
  };

  result.numberOfSignatures = count;
  result.page = page;
  result.numberOfPages = numberOfPages;

  if (offset > 0) {
    // eslint-disable-next-line no-underscore-dangle
    result._links.prev = {
      href: `${req.baseUrl}/?page=${page - 1}`,
    };
  }

  if (registrations.length <= limit) {
    // eslint-disable-next-line no-underscore-dangle
    result._links.next = {
      href: `${req.baseUrl}/?page=${page + 1}`,
    };
  }

  const errors = [];
  const formData = {
    name: '',
    nationalId: '',
    anonymous: false,
    comment: '',
  };

  const loggedin = req.isAuthenticated();

  return {
    errors, formData, result, loggedin,
  };
}
