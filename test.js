/* global describe, it */
var util = require('util')
var expect = require('chai').expect
var sanitize = require('./')()

/**
 * An array of all the tests to execute. Tests are in the format of:
 * ["params", "object", "valid"]
 *
 * @type {Array}
 */
var TESTS = [
  /**
   * String sanitization.
   */
  [
    {
      param: { type: 'string' }
    },
    { param: null },
    { param: null }
  ],
  [
    {
      param: { type: 'string' }
    },
    { param: 'test' },
    { param: 'test' }
  ],
  [
    {
      param: { type: 'string' }
    },
    { param: 123 },
    { param: '123' }
  ],
  [
    {
      param: { type: 'string' }
    },
    { param: true },
    { param: 'true' }
  ],
  [
    {
      param: { type: 'string' }
    },
    { param: ['test'] },
    { param: 'test' }
  ],
  /**
   * Number sanitization.
   */
  [
    {
      param: { type: 'number' }
    },
    { param: null },
    { param: null }
  ],
  [
    {
      param: { type: 'number' }
    },
    { param: 123 },
    { param: 123 }
  ],
  [
    {
      param: { type: 'number' }
    },
    { param: '123.5' },
    { param: 123.5 }
  ],
  [
    {
      param: { type: 'number' }
    },
    { param: '123' },
    { param: 123 }
  ],
  [
    {
      param: { type: 'number' }
    },
    { param: Infinity },
    { param: Infinity }
  ],
  [
    {
      param: { type: 'number' }
    },
    { param: 'abc' },
    { param: 'abc' }
  ],
  [
    {
      param: { type: 'number' }
    },
    { param: new Array(50).join(5) + '.' + new Array(50).join(5) },
    { param: Number(new Array(50).join(5) + '.' + new Array(50).join(5)) }
  ],
  [
    {
      param: { type: 'number' }
    },
    { param: '123.5' },
    { param: 123.5 }
  ],
  /**
   * Integer sanitization.
   */
  [
    {
      param: { type: 'integer' }
    },
    { param: null },
    { param: null }
  ],
  [
    {
      param: { type: 'integer' }
    },
    { param: 123 },
    { param: 123 }
  ],
  [
    {
      param: { type: 'integer' }
    },
    { param: 123.5 },
    { param: 123.5 }
  ],
  [
    {
      param: { type: 'integer' }
    },
    { param: '123.5' },
    { param: '123.5' }
  ],
  [
    {
      param: { type: 'integer' }
    },
    { param: '123' },
    { param: 123 }
  ],
  [
    {
      param: { type: 'integer' }
    },
    { param: Infinity },
    { param: Infinity }
  ],
  [
    {
      param: { type: 'integer' }
    },
    { param: new Array(50).join(5) },
    { param: Number(new Array(50).join(5)) }
  ],
  [
    {
      param: { type: 'integer' }
    },
    { param: ['123'] },
    { param: 123 }
  ],
  /**
   * Date sanitization.
   */
  [
    {
      param: { type: 'date' }
    },
    { param: undefined },
    { param: undefined }
  ],
  [
    {
      param: { type: 'date' }
    },
    { param: 'Mon, 23 Jun 2014 01:19:34 GMT' },
    { param: new Date('Mon, 23 Jun 2014 01:19:34 GMT') }
  ],
  [
    {
      param: { type: 'date' }
    },
    { param: 'abc' },
    { param: 'abc' }
  ],
  [
    {
      param: { type: 'date' }
    },
    { param: ['Mon, 23 Jun 2014 01:19:34 GMT'] },
    { param: new Date('Mon, 23 Jun 2014 01:19:34 GMT') }
  ],
  /**
   * Boolean sanitization.
   */
  [
    {
      param: { type: 'boolean' }
    },
    { param: null },
    { param: null }
  ],
  [
    {
      param: { type: 'boolean' }
    },
    { param: '' },
    { param: false }
  ],
  [
    {
      param: { type: 'boolean' }
    },
    { param: 'false' },
    { param: false }
  ],
  [
    {
      param: { type: 'boolean' }
    },
    { param: 'true' },
    { param: true }
  ],
  [
    {
      param: { type: 'boolean' }
    },
    { param: true },
    { param: true }
  ],
  [
    {
      param: { type: 'boolean' }
    },
    { param: false },
    { param: false }
  ],
  [
    {
      param: { type: 'boolean' }
    },
    { param: '0' },
    { param: false }
  ],
  [
    {
      param: { type: 'boolean' }
    },
    { param: '1' },
    { param: true }
  ],
  [
    {
      param: { type: 'boolean' }
    },
    { param: '2' },
    { param: true }
  ],
  [
    {
      param: { type: 'boolean' }
    },
    { param: 'a' },
    { param: true }
  ],
  [
    {
      param: { type: 'boolean' }
    },
    { param: ['a'] },
    { param: true }
  ],
  /**
   * Array sanitization.
   */
  [
    {
      param: { type: 'array' }
    },
    { param: null },
    { param: null }
  ],
  [
    {
      param: { type: 'array' }
    },
    { param: '[]' },
    { param: [] }
  ],
  [
    {
      param: { type: 'array' }
    },
    { param: '["a"]' },
    { param: ['a'] }
  ],
  [
    {
      param: { type: 'array' }
    },
    { param: '[a]' },
    { param: '[a]' }
  ],
  [
    {
      param: { type: 'array' }
    },
    { param: '[1]' },
    { param: [1] }
  ],
  [
    {
      param: { type: 'array' }
    },
    { param: '["a", 1, true]' },
    { param: ['a', 1, true] }
  ],
  [
    {
      param: { type: 'array' }
    },
    { param: '["a", 1, tru]' },
    { param: '["a", 1, tru]' }
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
  TESTS.forEach(function (test) {
    var params = test[0]
    var object = test[1]
    var output = test[2]

    var description = [
      util.inspect(params),
      'should sanitize',
      util.inspect(object)
    ].join(' ')

    it(description, function () {
      expect(sanitize(params)(object)).to.deep.equal(output)
    })
  })
})
