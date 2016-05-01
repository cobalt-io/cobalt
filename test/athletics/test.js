import test from 'ava'
import testData from './testData.json'
import request from 'supertest'

import cobalt from '../../src/index'
import Athletics from '../../src/api/athletics/model'

let expectedTestData = []

test.cb.before('setup', t => {
  // Drop all documents
  Athletics.remove({}, err => {
    if (err) t.fail(err.message)
    // Insert test data
    Athletics.create(testData, err => {
      if (err) t.fail(err.message)
      // Populate expectedTestData (remove `date_num`)
      for (let i = 0; i < testData.length; i++) {
        let doc = testData[i]
        delete doc.date_num
        Object.freeze(doc)
        expectedTestData.push(doc)
      }
      t.end()
    })
  })
})

/* list tests */

test.cb('/', t => {
  request(cobalt.Server)
    .get('/1.0/athletics')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(expectedTestData.slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/?limit=0', t => {
  request(cobalt.Server)
    .get('/1.0/athletics?limit=0')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/?limit=2', t => {
  request(cobalt.Server)
    .get('/1.0/athletics?limit=2')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(expectedTestData.slice(0, 2))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/?limit=200', t => {
  request(cobalt.Server)
    .get('/1.0/athletics?limit=200')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/?skip=10', t => {
  request(cobalt.Server)
    .get('/1.0/athletics?skip=10')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(expectedTestData.slice(10, 20))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/?skip=200', t => {
  request(cobalt.Server)
    .get('/1.0/athletics?skip=200')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/?skip=2&limit=2', t => {
  request(cobalt.Server)
    .get('/1.0/athletics?skip=2&limit=2')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(expectedTestData.slice(2, 4))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

// /* show tests */

test.cb(`/${testData[0].date}`, t => {
  request(cobalt.Server)
    .get(`/1.0/athletics/${testData[0].date}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(expectedTestData[0])
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/2016-04-02', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/2016-04-02')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(expectedTestData.filter(doc => doc.date.match('2016-04-02'))[0])
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/2018-04-02', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/2018-04-02')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

/* filter tests */

test.cb('/filter?q=', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:"2016-04-01"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:%222016-04-01%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(expectedTestData.filter(doc => doc.date.match('2016-04-01')))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=campus:"utm" AND campus:"utsc" OR campus:"utsg"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=campus:%22utm%22%20AND%20campus:%22utsc%22%20OR%20campus:%22utsg%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:>"2016"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:%3E%222016%22')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:<"2016"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:%3C%222016%22')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:-"2016-05-01"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:-%222016-05-01%22')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(expectedTestData.slice(0, 10))
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=date:"today"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=date:%22today22')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=duration:<1800 OR duration:>38400', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=duration:%3C1800%20OR%20duration:%3E38400')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('[]')
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=start:"k4:00"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=start:%22k4:00%22')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=start:"now" AND end:"later"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=start:%22now%22%20AND%20end:%22later%22')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=duration:"25:00"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=duration:%22250:00%22')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=start:"k4:00"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=start:%22k4:00%22')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb('/filter?q=start:"now" AND end:"later"', t => {
  request(cobalt.Server)
    .get('/1.0/athletics/filter?q=start:%22now%22%20AND%20end:%22later%22')
    .expect('Content-Type', /json/)
    .expect(400)
    .end((err, res) => {
      if (err) t.fail(err.message)
      t.pass()
      t.end()
    })
})

test.cb.after('cleanup', t => {
  Athletics.remove({}, err => {
    if (err) t.fail(err.message)
    t.end()
  })
})
