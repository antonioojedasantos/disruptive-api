/* eslint-disable no-console */
const { MongoClient, ObjectId } = require('mongodb');
const { config } = require('../config');

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const DB_NAME = config.dbName;
const IS_IN_PRODUCTION = config.isInProduction;
var MONGO_URI = `mongodb+srv://${USER}:${PASSWORD}@${config.dbHost}?retryWrites=true&w=majority&appName=Cluster0`;
if (IS_IN_PRODUCTION === 'false') {
  MONGO_URI = `mongodb://${config.dbHost}:27017`;
  console.log('Enabling production enviroment');
}

class MongoLib {
  constructor() {
    this.client = new MongoClient(MONGO_URI, { useNewUrlParser: true });
    this.dbName = DB_NAME;
  }

  connect() {
    if (!MongoLib.connection) {
      MongoLib.connection = new Promise((resolve, reject) => {
        this.client.connect(err => {
          if (err) {
            reject(err);
            console.log(err);
          }

          console.log('Connected succesfully to mongo ' + this.dbName);
          resolve(this.client.db(this.dbName));
        });
      });
    }

    return MongoLib.connection;
  }

  deleteOne(collection, id) {
    return this.connect().then(db => {
      return db.collection(collection).deleteOne({ _id: ObjectId(id) });
    });
  }

  getOne(collection, query) {
    console.log(query)
    return this.connect().then(db => {
      return db.collection(collection).findOne(query);
    });
  }

  getAllProjection(collection, query, dato) {
    return this.connect().then(db => {
      return db
        .collection(collection)
        .find(query, { projection: dato })
        .toArray();
    });
  }

  getAll(collection, query) {
    return this.connect().then(db => {
      return db
        .collection(collection)
        .find(query)
        .toArray();
    });
  }

  create(collection, data) {
    return this.connect()
      .then(db => {
        return db.collection(collection).insertOne(data);
      })
      .then(result => result.insertedId);
  }

  getId(collection, id) {
    return this.connect().then(db => {
      return db.collection(collection).findOne({ _id: ObjectId(id) });
    });
  }

  getAllDatos(collection, query, date) {
    return this.connect().then(db => {
      return db
        .collection(collection)
        .find(query, date)
        .toArray();
    });
  }

  deleteFavorite(collection, id_offer, id_customer) {
    return this.connect()
      .then(db => {
        return db
          .collection(collection)
          .updateOne(
            { _id: ObjectId(id_offer) },
            { $pull: { favorites: { id: ObjectId(id_customer) } } }
          );
      })
      .then(result => result.upsertedId || id_offer);
  }

  getFavorite(collection, id, id_customer) {
    return this.connect().then(db => {
      return db
        .collection(collection)
        .findOne({ 'favorites.id': ObjectId(id_customer), _id: ObjectId(id) });
    });
  }

  getAllBySort(
    collection,
    query = {},
    sort = { _id: 1 },
    limit = 0,
    show = {}
  ) {
    return this.connect().then(db => {
      return db
        .collection(collection)
        .find(query, show)
        .sort(sort)
        .limit(limit)
        .toArray();
    });
  }

  ///metodo a componer <>

  getNumberCommerce(collection) {
    return this.connect().then(db => {
      return db.collection(collection).countDocuments();
    });
  }

  getAllWithoutFilter(collection) {
    return this.connect().then(db => {
      return db
        .collection(collection)
        .find({})
        .toArray();
    });
  }

  get(collection, id) {
    return this.connect().then(db => {
      return db.collection(collection).findOne({ _id: ObjectId(id) });
    });
  }

  getObject(collection, id) {
    return this.connect().then(db => {
      return db.collection(collection).findOne({ _id: id });
    });
  }
  getWithProjection(collection, id, projection) {
    return this.connect().then(db => {
      return db
        .collection(collection)
        .findOne({ _id: ObjectId(id) }, { projection: projection });
    });
  }

  getFavorites(collection, id_customer, id) {
    return this.connect().then(db => {
      return db
        .collection(collection)
        .findOne({ _id: ObjectId(id), favorites: ObjectId(id_customer) });
    });
  }

  update(collection, id, data) {
    return this.connect()
      .then(db => {
        return db
          .collection(collection)
          .updateOne({ _id: ObjectId(id) }, { $set: data }, { upsert: true });
      })
      .then(result => result.upsertedId || id);
  }

  getAllOffers(collection, date, id) {
    //db.ndtl_offers.find({$and : [{start_date : {$lte : "2020-07-11"}}, {end_date: {$gte : "2020-07-11"}}],id_store:"5ef7f8abd627fa4280610716"})
    return this.connect().then(db => {
      return db
        .collection(collection)
        .find({
          $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }],
          id_store: id
        })
        .toArray();
    });
  }

  getOffers(collection, dato) {
    return this.connect().then(db => {
      return db
        .collection(collection)
        .find({ id_store: dato })
        .toArray();
    });
  }
  getRadios(collection, date) {
    return this.connect().then(db => {
      return db
        .collection(collection)
        .find({ listen_on_city: date })
        .toArray();
    });
  }

  getEmail(collection, username) {
    return this.connect().then(db => {
      return db.collection(collection).findOne({ email: username });
    });
  }

  findStores(collection, lat, lng) {
    return this.connect().then(db => {
      return db
        .collection(collection)
        .find({
          neural_ping_store: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [lng, lat]
              },
              $maxDistance: 10000
            }
          }
        })
        .toArray();
    });
  }

  sdp(collection) {
    return this.connect().then(db => {
      return db.collection(collection).createIndex({ geodata: '2dsphere' });
    });
  }

  executeAggregation(collection, aggregation) {
    return this.connect().then(db => {
      return db
        .collection(collection)
        .aggregate(aggregation)
        .toArray();
    });
  }
  count(collection, query) {
    return this.connect().then(db => {
      return db
        .collection(collection)
        .count(query);
    });
  }
}

module.exports = MongoLib;
