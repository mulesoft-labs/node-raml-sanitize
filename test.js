/* global describe, it */
var util     = require('util');
var expect   = require('chai').expect;
var sanitize = require('./')();

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
    { param: NaN }
  ],
  [
    {
      param: { type: 'number' }
    },
    { param: 'abc' },
    { param: NaN }
  ],
  [
    {
      param: { type: 'number' }
    },
    { param: new Array(50).join(5) + '.' + new Array(50).join(5) },
    { param: Number(new Array(50).join(5) + '.' + new Array(50).join(5)) }
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
    { param: NaN }
  ],
  [
    {
      param: { type: 'integer' }
    },
    { param: '123.5' },
    { param: NaN }
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
    { param: NaN }
  ],
  [
    {
      param: { type: 'integer' }
    },
    { param: new Array(50).join(5) },
    { param: Number(new Array(50).join(5)) }
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
    { param: new Date('abc') }
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
  /**
   * Repeated values.
   */
  [
    {
      param: { type: 'integer', repeat: true }
    },
    { param: null },
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
    { param: [123, NaN] }
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
  ]
];

describe('raml-sanitize', function () {
  /**
   * Run through each of the defined tests to generate the test suite.
   */
  TESTS.forEach(function (test) {
    var params = test[0];
    var object = test[1];
    var output = test[2];

    var description = [
      util.inspect(params),
      'should sanitize',
      util.inspect(object)
    ].join(' ');

    it(description, function () {
      expect(sanitize(params)(object)).to.deep.equal(output);
    });
  });
});
