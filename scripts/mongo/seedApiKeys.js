//set DEBUG=app:* node scripts/mongo/seedApiKeys.js
//DEBUG=app:* node scripts/mongo/seedApiKeys.js

const chalk = require('chalk');
const crypto = require('crypto');
const debug = require('debug')('app:scripts:api-keys');
const MongoLib = require('../../lib/mongo');

const adminScopes = [
  'create:theme',
  'read:theme',
  'create:content',
  'read:content',
  'create:category,'
];

const readerScopes = [
'read:content',
'read:theme',
'read:content'
 
];

const creatorScopes = [
  'read:theme',
'create:theme',
'read:content'
];

const apiKeys = [
  {
    token: generateRandomToken(),
    type: 'admin',
    scopes: adminScopes
  },
  {
    token: generateRandomToken(),
    type: 'reader',
    scopes: readerScopes
  },
  {
    token: generateRandomToken(),
    type: 'creator',
    scopes: creatorScopes
  }
];

function generateRandomToken() {
  const buffer = crypto.randomBytes(32);
  return buffer.toString('hex');
}

async function seedApiKeys() {
  try {
    const mongoDB = new MongoLib();

    const promises = apiKeys.map(async apiKey => {
      await mongoDB.create('ndtl_user_scopes', apiKey);
    });

    await Promise.all(promises);
    debug(chalk.green(`${promises.length} api keys have been created succesfully`)); // prettier-ignore
    return process.exit(0);
  } catch (error) {
    debug(chalk.red(error));
    process.exit(1);
  }
}

seedApiKeys();
