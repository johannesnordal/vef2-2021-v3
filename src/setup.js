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
  for (let i = 0; i < 10; i++) {
    nationalId += Math.floor(Math.random() * 10);
  }
  let name = faker.name.findName();
  let comment = '';
  if (Math.random() < 0.5) {
    comment = faker.lorem.sentence();
  }
  let anonymous = '';
  if (Math.random() < 0.5) {
    anonymous = 'on';
  }
  return { name, nationalId, comment, anonymous };
}

async function addFakeSignatures() {
  for (let i = 0; i <= 500; i++) {
    const signature = createFakeSignature();
    await insert(signature);
  }

  await end();
}

create().catch((err) => {
  console.error('Error creating schema', err);
});

createUser('admin', '123', true);
addFakeSignatures();
