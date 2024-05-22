//set DEBUG=app:* node scripts/mongo/seedApiKeys.js
//DEBUG=app:* node scripts/mongo/seedApiKeys.js

const chalk = require('chalk');
const crypto = require('crypto');
const debug = require('debug')('app:scripts:api-keys');
const MongoLib = require('../../lib/mongo');

const adminScopes = [
  'create:theme',
  'signup:auth',
  'read:commerce',
  'create:commerce',
  'update:commerce',
  'delete:commerce',
  'read:commerce-details',
  'create:commerce-details',
  'update:commerce-details',
  'delete:commerce-details',
  'create:subsidiary',
  'read:subsidiary',
  'update:subsidiary',
  'delete:subsidiary',
  'create:all-commerces',
  'read:all-commerces',
  'update:all-commerces',
  'delete:all-commerces',
  'read:offer',
  'update:audience',
  'read:audience',
  'create:sms',
  'read:sms',
];

const readerScopes = [
  'signin:auth',
  'signup:auth',
  'create:commerce',
  'read:commerce',
  'update:commerce',
  'read:commerce-details',
  'create:subsidiary',
  'read:subsidiary',
  'update:subsidiary',
  'delete:subsidiary',
  'read:offer',
  'update:offer',
  'create:offer',
  'create:audience',
  'read:audience',
  'create:agency',
  'delete:audience',
  'update:audience',
  'delete:employee',
  'assing:audience',
  'create:sms',
  'read:sms',
  'create:employee',
  'read:employee'
];

const creatorScopes = [
  'signin:auth',
  'signup:auth',
  'read:commerce-details',
  'create:subsidiary',
  'read:subsidiary',
  'update:subsidiary',
  'delete:subsidiary',
  'read:audience',
  'create:sms',
  'read:sms',
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
