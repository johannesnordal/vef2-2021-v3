import faker from 'faker';
import { readFile } from 'fs/promises';
import { insert, query, end } from './db.js';
import { createUser } from './users.js';

const schemaFile = './sql/schema.sql';

async function create() {
  const data = await readFile(schemaFile);

  await query(data.toString('utf-8'));

  console.info('Schema created');
}

function createFakeSignature() {
  let nationalId = '';

  for (let i = 0; i < 10; i += 1) {
    nationalId += Math.floor(Math.random() * 10);
  }

  const name = faker.name.findName();

  let comment = '';

  if (Math.random() < 0.5) {
    comment = faker.lorem.sentence();
  }

  let anonymous = '';

  if (Math.random() < 0.5) {
    anonymous = 'on';
  }

  const signed = faker.date.recent(14, new Date());

  const signature = {
    name,
    nationalId,
    comment,
    anonymous,
    signed,
  };

  return signature;
}

async function addFakeSignatures() {
  for (let s = 0; s <= 500; s += 1) {
    const signature = createFakeSignature();
    // eslint-disable-next-line no-await-in-loop
    await insert(signature);
  }

  await end();
}

create().catch((err) => {
  console.error('Error creating schema', err);
});

createUser('admin', '123', true);
addFakeSignatures();
