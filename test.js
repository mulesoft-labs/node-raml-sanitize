/* global describe, it */
const util = require('util')
const expect = require('chai').expect
const sanitize = require('./')()
const dm = require('webapi-parser').model.domain

const TYPES = {
  string: 'http://www.w3.org/2001/XMLSchema#string',
  number: 'http://www.w3.org/2001/XMLSchema#number',
  integer: 'http://www.w3.org/2001/XMLSchema#integer',
  boolean: 'http://www.w3.org/2001/XMLSchema#boolean',
  date: 'http://www.w3.org/2001/XMLSchema#date',
  dateTime: 'http://www.w3.org/2001/XMLSchema#dateTime',
  dateTimeOnly: 'http://a.ml/vocabularies/shapes#dateTimeOnly'
}

/**
 * An array of all the tests to execute. Tests are in the format of:
 * ["params", "object", "valid"]
 *
 * @type {Array}
 */
const TESTS = [
  /**
   * String sanitization.
   */
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.string),
    { param: null },
    { param: null }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.string),
    { param: 'test' },
    { param: 'test' }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.string),
    { param: 123 },
    { param: '123' }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.string),
    { param: true },
    { param: 'true' }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.string),
    { param: ['test'] },
    { param: 'test' }
  ],
  /**
   * Number sanitization.
   */
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.number),
    { param: null },
    { param: null }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.number),
    { param: 123 },
    { param: 123 }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.number),
    { param: '123.5' },
    { param: 123.5 }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.number),
    { param: '123' },
    { param: 123 }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.number),
    { param: Infinity },
    { param: Infinity }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.number),
    { param: 'abc' },
    { param: 'abc' }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.number),
    { param: new Array(50).join(5) + '.' + new Array(50).join(5) },
    { param: Number(new Array(50).join(5) + '.' + new Array(50).join(5)) }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.number),
    { param: '123.5' },
    { param: 123.5 }
  ],
  /**
   * Integer sanitization.
   */
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.integer),
    { param: null },
    { param: null }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.integer),
    { param: 123 },
    { param: 123 }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.integer),
    { param: 123.5 },
    { param: 123.5 }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.integer),
    { param: '123.5' },
    { param: '123.5' }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.integer),
    { param: '123' },
    { param: 123 }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.integer),
    { param: Infinity },
    { param: Infinity }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.integer),
    { param: new Array(50).join(5) },
    { param: Number(new Array(50).join(5)) }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.integer),
    { param: ['123'] },
    { param: 123 }
  ],
  /**
   * Date sanitization.
   */
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.date),
    { param: undefined },
    { param: undefined }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.date),
    { param: '2015-05-23' },
    { param: new Date('2015-05-23') }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.date),
    { param: 'abc' },
    { param: 'abc' }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.date),
    { param: ['2015-05-23'] },
    { param: new Date('2015-05-23') }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.dateTime),
    { param: undefined },
    { param: undefined }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.dateTime),
    { param: 'Sun, 28 Feb 2016 16:41:41 GMT' },
    { param: new Date('Sun, 28 Feb 2016 16:41:41 GMT') }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.dateTime),
    { param: '2016-02-28T16:41:41.090Z' },
    { param: new Date('2016-02-28T16:41:41.090Z') }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.dateTime),
    { param: 'abc' },
    { param: 'abc' }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.dateTime),
    { param: ['Sun, 28 Feb 2016 16:41:41 GMT'] },
    { param: new Date('Sun, 28 Feb 2016 16:41:41 GMT') }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.dateTime),
    { param: ['2016-02-28T16:41:41.090Z'] },
    { param: new Date('2016-02-28T16:41:41.090Z') }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.dateTimeOnly),
    { param: undefined },
    { param: undefined }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.dateTimeOnly),
    { param: '2015-07-04T21:00:00' },
    { param: new Date('2015-07-04T21:00:00') }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.dateTimeOnly),
    { param: 'abc' },
    { param: 'abc' }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.dateTimeOnly),
    { param: ['2015-07-04T21:00:00'] },
    { param: new Date('2015-07-04T21:00:00') }
  ],
  /**
   * Boolean sanitization.
   */
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.boolean),
    { param: null },
    { param: null }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.boolean),
    { param: '' },
    { param: false }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.boolean),
    { param: 'false' },
    { param: false }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.boolean),
    { param: 'true' },
    { param: true }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.boolean),
    { param: true },
    { param: true }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.boolean),
    { param: false },
    { param: false }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.boolean),
    { param: '0' },
    { param: false }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.boolean),
    { param: '1' },
    { param: true }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.boolean),
    { param: '2' },
    { param: true }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.boolean),
    { param: 'a' },
    { param: true }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.boolean),
    { param: ['a'] },
    { param: true }
  ],
  /**
   * Array sanitization.
   */
  [
    new dm.ArrayShape(),
    { param: null },
    { param: null }
  ],
  [
    new dm.ArrayShape(),
    { param: '[]' },
    { param: [] }
  ],
  [
    new dm.ArrayShape(),
    { param: '["a"]' },
    { param: ['a'] }
  ],
  [
    new dm.ArrayShape(),
    { param: '[a]' },
    { param: '[a]' }
  ],
  [
    new dm.ArrayShape(),
    { param: '[1]' },
    { param: [1] }
  ],
  [
    new dm.ArrayShape(),
    { param: '["a", 1, true]' },
    { param: ['a', 1, true] }
  ],
  [
    new dm.ArrayShape(),
    { param: '["a", 1, tru]' },
    { param: '["a", 1, tru]' }
  ],
  [
    new dm.ArrayShape(),
    { param: 123 },
    { param: [123] }
  ],
  [
    new dm.ArrayShape(),
    { param: 'foo' },
    { param: ['foo'] }
  ],
  [
    new dm.ArrayShape(),
    { param: ['foo'] },
    { param: ['foo'] }
  ],
  [
    new dm.ArrayShape(),
    { param: { foo: 'boo' } },
    { param: [{ foo: 'boo' }] }
  ],
  [
    new dm.ArrayShape(),
    { param: [123, 456] },
    { param: [123, 456] }
  ],
  [
    new dm.ScalarShape().withName('param').withDataType(TYPES.string),
    { param: '123' },
    { param: '123' }
  ],
  [
    {
      param: { type: ['string', 'array'] }
    },
    { param: '123' },
    { param: '123' }
  ],
  [
    {
      param: { type: ['string', 'array'] }
    },
    { param: 123 },
    { param: 123 }
  ],
  [
    {
      param: { type: ['string', 'array'] }
    },
    { param: [123, 234] },
    { param: [123, 234] }
  ],
  /**
   * Object sanitization.
   */
  [
    {
      param: { type: 'object' }
    },
    { param: null },
    { param: null }
  ],
  [
    {
      param: { type: 'object' }
    },
    { param: '{}' },
    { param: {} }
  ],
  [
    {
      param: { type: 'object' }
    },
    { param: '{ "foo" :"bar"}' },
    { param: { foo: 'bar' } }
  ],
  [
    {
      param: { type: 'object' }
    },
    { param: '{"foo": 1 }' },
    { param: { foo: 1 } }
  ],
  [
    {
      param: { type: 'object' }
    },
    { param: '{"foo": true }' },
    { param: { foo: true } }
  ],
  [
    {
      param: { type: 'object' }
    },
    { param: '{"foo"}' },
    { param: '{"foo"}' }
  ],
  [
    {
      param: { type: 'object' }
    },
    { param: '{"foo" : 1, }' },
    { param: '{"foo" : 1, }' }
  ],
  /**
   * Repeated values.
   */
  [
    {
      param: { type: 'boolean' }
    },
    { param: [123, 456] },
    { param: [123, 456] }
  ],
  [
    {
      param: { type: 'integer', repeat: true }
    },
    {},
    { param: [] }
  ],
  [
    {
      param: { type: 'integer', repeat: true }
    },
    { param: '5' },
    { param: [5] }
  ],
  [
    {
      param: { type: 'number', repeat: true }
    },
    { param: '123' },
    { param: [123] }
  ],
  [
    {
      param: { type: 'number', repeat: true }
    },
    { param: ['123', 'abc'] },
    { param: ['123', 'abc'] }
  ],
  [
    {
      param: { type: 'boolean', repeat: true }
    },
    { param: ['0', '1', '2'] },
    { param: [false, true, true] }
  ],
  [
    {
      param: { type: 'string', repeat: true }
    },
    { param: 'abc123' },
    { param: ['abc123'] }
  ],
  /**
   * Default value sanitization.
   */
  [
    {
      param: { type: 'string', default: 'test' }
    },
    { param: 'abc' },
    { param: 'abc' }
  ],
  [
    {
      param: { type: 'string', default: 'test' }
    },
    { param: null },
    { param: 'test' }
  ],
  [
    {
      param: { type: 'string', default: 'test' }
    },
    {},
    { param: 'test' }
  ],
  [
    {
      param: { type: 'string', default: 'test', repeat: true }
    },
    { param: null },
    { param: ['test'] }
  ],
  [
    {
      param: { type: 'integer', default: 123 }
    },
    { param: null },
    { param: 123 }
  ],
  [
    {
      param: { type: 'integer', default: '123', repeat: true }
    },
    { param: null },
    { param: [123] }
  ],
  /**
   * Multiple sanitizations.
   */
  [
    {
      username: { type: 'string' },
      birthday: { type: 'date' },
      luckyNumber: { type: 'integer' }
    },
    {
      username: 'blakeembrey',
      birthday: 'Mon, 23 Jun 2014 01:19:34 GMT',
      luckyNumber: '3'
    },
    {
      username: 'blakeembrey',
      birthday: new Date('Mon, 23 Jun 2014 01:19:34 GMT'),
      luckyNumber: 3
    }
  ],
  /**
   * Multiple type sanitizations.
   */
  [
    {
      param: [
        {
          type: 'integer'
        },
        {
          type: 'string'
        }
      ]
    },
    {
      param: '123'
    },
    {
      param: 123
    }
  ],
  [
    {
      param: [
        {
          type: 'integer'
        },
        {
          type: 'string'
        }
      ]
    },
    {
      param: 'abc'
    },
    {
      param: 'abc'
    }
  ]
]

describe('raml-sanitize', function () {
  /**
   * Run through each of the defined tests to generate the test suite.
   */
  TESTS.forEach(([shapes, object, output]) => {
    const description = [
      util.inspect(shapes),
      'should sanitize',
      util.inspect(object)
    ].join(' ')

    it(description, function () {
      expect(sanitize(shapes)(object)).to.deep.equal(output)
    })
  })
})
