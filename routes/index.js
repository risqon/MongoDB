var express = require('express');
var router = express.Router();
const objectId = require('mongodb').ObjectId;
var moment = require('moment');


module.exports = (db, coll) => {
  router.get('/', function (req, res, next) {
    const { checkId, id, checkString, string, checkInteger, integer, checkFloat, float, checkBool, bool, checkDate, startDate, endDate } = req.query;
    let query = new Object();

    if (checkId && id) {
      query._id = id;
    }
    if (checkString && string) {
      query.string = string;
    }
    if (checkInteger && integer) {
      query.integer = integer;
    }
    if (checkFloat && float) {
      query.float = float;
    }
    if (checkBool && bool) {
      query.boolean = bool;
    }
    if (checkDate && startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate }
    }

    const page = req.query.page || 1;
    const limit = 2;

    const offset = (page - 1) * limit;

    //New Page by Pagination
    let url = req.url.includes('page') ? req.url : `/?page=1&` + req.url.slice(2)

    //Use Promise
    db.collection(coll).count()
      .then((total) => {
        const pages = Math.ceil(total / limit)

        db.collection(coll).find(query).limit(limit).skip(offset).toArray()
          .then((result) => {

            res.status(200).render('index', {
              moment,
              result,
              page,
              pages,
              url
            })
              .catch((err) => {
                res.status(500).json({
                  error: true,
                  message: err
                })
              })
          })
      })
  });

  router.get('/add', (req, res) => { res.render('add') });

  router.post('/add', (req, res) => {
    const add = {
      "string": req.body.string,
      "integer": req.body.integer,
      "float": req.body.float,
      "date": req.body.date,
      "boolean": req.body.boolean
    }

    db.collection(coll).insertOne(add)
      .then(() => res.redirect('/'))
      .catch(err =>
        res.status(500).json({
          error: true,
          message: err
        }))
  });

  router.get('/delete/:id', (req, res) => {
    const id = req.params.id
    db.collection(coll).deleteOne({ _id: objectId(id) })
      .then(() => res.redirect('/'))
      .catch((err) => {
        res.status(500).json({
          error: true,
          message: err
        })
      })
  });

  router.get('/edit/:id', (req, res) => {

    const id = req.params.id;

    db.collection(coll).findOne({ _id: objectId(id) })
      .then((result) => {
        res.render('edit', { row: result })
      })
      .catch((err) => {
        res.status(500).json({
          error: true,
          message: err
        })
      })
  })


  router.post('/edit/:id', (req, res) => {

    const id = req.params.id;

    db.collection(coll).updateOne(
      { _id: objectId(id) },
      {
        $set: {
          string: req.body.string,
          integer: req.body.integer,
          float: req.body.float,
          date: req.body.date,
          boolean: req.body.boolean
        }
      })
      .then((result) => res.redirect('/'))
      .catch((err) => {
        res.status(500).json({
          error: true,
          message: err
        })
      })
  })

  return router;
}
