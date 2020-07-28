/* global describe, it, before */
const util = require('util')
const expect = require('chai').expect
const sanitize = require('./')()
const wp = require('webapi-parser')
const domain = wp.model.domain

const TYPES = {
  string: 'http://www.w3.org/2001/XMLSchema#string',
  number: 'http://a.ml/vocabularies/shapes#number',
  integer: 'http://www.w3.org/2001/XMLSchema#integer',
  boolean: 'http://www.w3.org/2001/XMLSchema#boolean',
  date: 'http://www.w3.org/2001/XMLSchema#date',
  dateTime: 'http://www.w3.org/2001/XMLSchema#dateTime',
  dateTimeOnly: 'http://a.ml/vocabularies/shapes#dateTimeOnly'
}

function asParam (shape) {
  return new domain.Parameter()
    .withName('param')
    .withSchema(shape)
    .withRequired(true)
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
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.string)),
    { foo: 'hello' },
    {}
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.string)),
    { param: null },
    { param: null }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.string)),
    { param: 'test' },
    { param: 'test' }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.string)),
    { param: 123 },
    { param: '123' }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.string)),
    { param: true },
    { param: 'true' }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.string)),
    { param: ['test'] },
    { param: 'test' }
  ],
  /**
   * Number sanitization.
   */
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.number)),
    { param: null },
    { param: null }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.number)),
    { param: 123 },
    { param: 123 }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.number)),
    { param: '123.5' },
    { param: 123.5 }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.number)),
    { param: '123' },
    { param: 123 }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.number)),
    { param: Infinity },
    { param: Infinity }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.number)),
    { param: 'abc' },
    { param: 'abc' }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.number)),
    { param: new Array(50).join(5) + '.' + new Array(50).join(5) },
    { param: Number(new Array(50).join(5) + '.' + new Array(50).join(5)) }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.number)),
    { param: '123.5' },
    { param: 123.5 }
  ],
  /**
   * Integer sanitization.
   */
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)),
    { param: null },
    { param: null }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)),
    { param: 123 },
    { param: 123 }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)),
    { param: 123.5 },
    { param: 123.5 }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)),
    { param: '123.5' },
    { param: '123.5' }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)),
    { param: '123' },
    { param: 123 }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)),
    { param: Infinity },
    { param: Infinity }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)),
    { param: new Array(50).join(5) },
    { param: Number(new Array(50).join(5)) }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)),
    { param: ['123'] },
    { param: 123 }
  ],
  /**
   * Date sanitization.
   */
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.date)),
    { param: undefined },
    { param: undefined }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.date)),
    { param: '2015-05-23' },
    { param: new Date('2015-05-23') }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.date)),
    { param: 'abc' },
    { param: 'abc' }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.date)),
    { param: ['2015-05-23'] },
    { param: new Date('2015-05-23') }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTime)),
    { param: undefined },
    { param: undefined }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTime)),
    { param: 'Sun, 28 Feb 2016 16:41:41 GMT' },
    { param: new Date('Sun, 28 Feb 2016 16:41:41 GMT') }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTime)),
    { param: '2016-02-28T16:41:41.090Z' },
    { param: new Date('2016-02-28T16:41:41.090Z') }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTime)),
    { param: 'abc' },
    { param: 'abc' }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTime)),
    { param: ['Sun, 28 Feb 2016 16:41:41 GMT'] },
    { param: new Date('Sun, 28 Feb 2016 16:41:41 GMT') }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTime)),
    { param: ['2016-02-28T16:41:41.090Z'] },
    { param: new Date('2016-02-28T16:41:41.090Z') }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTimeOnly)),
    { param: undefined },
    { param: undefined }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTimeOnly)),
    { param: '2015-07-04T21:00:00' },
    { param: new Date('2015-07-04T21:00:00') }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTimeOnly)),
    { param: 'abc' },
    { param: 'abc' }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTimeOnly)),
    { param: ['2015-07-04T21:00:00'] },
    { param: new Date('2015-07-04T21:00:00') }
  ],
  /**
   * Boolean sanitization.
   */
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: null },
    { param: null }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: '' },
    { param: false }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: 'false' },
    { param: false }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: 'true' },
    { param: true }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: true },
    { param: true }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: false },
    { param: false }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: '0' },
    { param: false }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: '1' },
    { param: true }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: '2' },
    { param: true }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: 'a' },
    { param: true }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: ['a'] },
    { param: true }
  ],
  /**
   * Array sanitization.
   */
  [
    asParam(new domain.ArrayShape()),
    { param: null },
    { param: null }
  ],
  [
    asParam(new domain.ArrayShape()),
    { param: '[]' },
    { param: [] }
  ],
  [
    asParam(new domain.ArrayShape()),
    { param: '["a"]' },
    { param: ['a'] }
  ],
  [
    asParam(new domain.ArrayShape()),
    { param: '[a]' },
    { param: ['[a]'] }
  ],
  [
    asParam(new domain.ArrayShape()),
    { param: '[1]' },
    { param: [1] }
  ],
  [
    asParam(new domain.ArrayShape()),
    { param: '["a", 1, true]' },
    { param: ['a', 1, true] }
  ],
  [
    asParam(new domain.ArrayShape()),
    { param: '["a", 1, tru]' },
    { param: ['["a", 1, tru]'] }
  ],
  [
    asParam(new domain.ArrayShape()
      .withItems(new domain.ScalarShape().withDataType(TYPES.integer))),
    { param: 123 },
    { param: [123] }
  ],
  [
    asParam(new domain.ArrayShape()
      .withItems(new domain.ScalarShape().withDataType(TYPES.integer))),
    { param: ['123', '123'] },
    { param: [123, 123] }
  ],
  [
    asParam(new domain.ArrayShape()
      .withItems(new domain.ScalarShape().withDataType(TYPES.string))),
    { param: 'foo' },
    { param: ['foo'] }
  ],
  [
    asParam(new domain.ArrayShape()
      .withItems(new domain.ScalarShape().withDataType(TYPES.boolean))),
    { param: ['true', 'false'] },
    { param: [true, false] }
  ],
  [
    asParam(new domain.ArrayShape()
      .withItems(new domain.ScalarShape().withDataType(TYPES.boolean))),
    { param: '[true, false]' },
    { param: [true, false] }
  ],
  [
    asParam(new domain.ArrayShape()),
    { param: ['foo'] },
    { param: ['foo'] }
  ],
  [
    asParam(new domain.ArrayShape()
      .withItems(new domain.NodeShape())),
    { param: { foo: 'boo' } },
    { param: [{ foo: 'boo' }] }
  ],
  [
    asParam(new domain.ArrayShape()),
    { param: [123, 456] },
    { param: [123, 456] }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.string)),
    { param: '123' },
    { param: '123' }
  ],
  [
    asParam(new domain.UnionShape()
      .withName('param')
      .withAnyOf([
        new domain.ScalarShape().withDataType(TYPES.string),
        new domain.ArrayShape()
      ])),
    { param: '123' },
    { param: '123' }
  ],
  [
    asParam(new domain.UnionShape()
      .withName('param')
      .withAnyOf([
        new domain.ScalarShape().withDataType(TYPES.string),
        new domain.ArrayShape()
      ])),
    { param: 123 },
    { param: '123' }
  ],
  [
    asParam(new domain.UnionShape()
      .withName('param')
      .withAnyOf([
        new domain.ArrayShape(),
        new domain.ScalarShape().withDataType(TYPES.string)
      ])),
    { param: [123, 234] },
    { param: [123, 234] }
  ],
  /**
   * Object sanitization.
   */
  [
    asParam(new domain.NodeShape().withName('param')),
    { param: null },
    { param: null }
  ],
  [
    asParam(new domain.NodeShape().withName('param')),
    { param: '{}' },
    { param: {} }
  ],
  [
    asParam(new domain.NodeShape().withName('param')),
    { param: '{ "foo" :"bar"}' },
    { param: { foo: 'bar' } }
  ],
  [
    asParam(new domain.NodeShape().withName('param')),
    { param: '{"foo": 1 }' },
    { param: { foo: 1 } }
  ],
  [
    asParam(new domain.NodeShape().withName('param')),
    { param: '{"foo": true }' },
    { param: { foo: true } }
  ],
  [
    asParam(new domain.NodeShape().withName('param')),
    { param: '{"foo"}' },
    { param: '{"foo"}' }
  ],
  [
    asParam(new domain.NodeShape().withName('param')),
    { param: '{"foo" : 1, }' },
    { param: '{"foo" : 1, }' }
  ],
  /**
   * Arrays.
   */
  [
    asParam(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.integer))),
    { param: [123, 456] },
    { param: [123, 456] }
  ],
  [
    asParam(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.integer))),
    { param: '5' },
    { param: [5] }
  ],
  [
    asParam(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.integer))),
    { param: ['5'] },
    { param: [5] }
  ],
  [
    asParam(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.number))),
    { param: '123' },
    { param: [123] }
  ],
  [
    asParam(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.string))),
    { param: [123, 312] },
    { param: ['123', '312'] }
  ],
  [
    asParam(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.boolean))),
    { param: ['0', '1', '2'] },
    { param: [false, true, true] }
  ],
  [
    asParam(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.string))),
    { param: 'abc123' },
    { param: ['abc123'] }
  ],
  /**
   * Default value sanitization.
   */
  [
    asParam(new domain.ScalarShape().withDataType(TYPES.string)
      .withDefaultStr('test')),
    { param: 'abc' },
    { param: 'abc' }
  ],
  [
    asParam(new domain.ScalarShape().withDataType(TYPES.string)
      .withDefaultStr('test')),
    { param: null },
    { param: 'test' }
  ],
  [
    asParam(new domain.ScalarShape().withDataType(TYPES.string)
      .withDefaultStr('test')),
    {},
    { param: 'test' }
  ],
  [
    asParam(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.string))
      .withDefaultStr('["test"]')),
    { param: null },
    { param: ['test'] }
  ],
  [
    asParam(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)
      .withDefaultStr('123')),
    { param: null },
    { param: 123 }
  ],
  [
    asParam(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.integer))
      .withDefaultStr('[123]')),
    { param: null },
    { param: [123] }
  ],
  /**
   * Nested sanitization
   */
  [
    [
      new domain.PropertyShape()
        .withName('user')
        .withRange(
          new domain.NodeShape().withName('param').withProperties([
            new domain.PropertyShape()
              .withName('name')
              .withRange(
                new domain.NodeShape().withName('name').withProperties([
                  new domain.PropertyShape()
                    .withName('nameGroup')
                    .withRange(
                      new domain.ScalarShape().withName('nameGroup').withDataType(TYPES.string)
                    ),
                  new domain.PropertyShape()
                    .withName('nameId')
                    .withRange(
                      new domain.ScalarShape().withName('nameId').withDataType(TYPES.number)
                    ),
                  new domain.PropertyShape()
                    .withName('createdAt')
                    .withRange(
                      new domain.ScalarShape().withName('createdAt').withDataType(TYPES.date)
                    )
                ])
              ),
            new domain.PropertyShape()
              .withName('age')
              .withRange(
                new domain.ScalarShape().withName('age').withDataType(TYPES.number)
              )
          ])
        ),
      new domain.PropertyShape()
        .withName('userId')
        .withRange(
          new domain.ScalarShape().withName('userId').withDataType(TYPES.number)
        )
    ],
    {
      user: {
        name: {
          nameGroup: 'common',
          nameId: '87',
          createdAt: 'Mon, 23 Jun 2014 01:19:34 GMT'
        },
        age: '65'
      },
      userId: '5'
    },
    {
      user: {
        name: {
          nameGroup: 'common',
          nameId: 87,
          createdAt: new Date('Mon, 23 Jun 2014 01:19:34 GMT')
        },
        age: 65
      },
      userId: 5
    }
  ],
  /**
   * Multiple sanitizations.
   */
  [
    [
      new domain.PropertyShape()
        .withName('username')
        .withRange(
          new domain.ScalarShape().withName('username').withDataType(TYPES.string)
        ),
      new domain.PropertyShape()
        .withName('birthday')
        .withRange(
          new domain.ScalarShape().withName('birthday').withDataType(TYPES.date)
        ),
      new domain.PropertyShape()
        .withName('luckyNumber')
        .withRange(
          new domain.ScalarShape().withName('luckyNumber').withDataType(TYPES.integer)
        )
    ],
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
    asParam(new domain.UnionShape()
      .withName('param')
      .withAnyOf([
        new domain.ScalarShape().withDataType(TYPES.integer),
        new domain.ScalarShape().withDataType(TYPES.string)
      ])),
    { param: '123' },
    { param: 123 }
  ],
  [
    asParam(new domain.UnionShape()
      .withName('param')
      .withAnyOf([
        new domain.ScalarShape().withDataType(TYPES.integer),
        new domain.ScalarShape().withDataType(TYPES.string)
      ])),
    { param: 'abc' },
    { param: 'abc' }
  ]
]

describe('raml-sanitize', function () {
  before(async function () {
    await wp.WebApiParser.init()
  })
  /**
   * Run through each of the defined tests to generate the test suite.
   */
  TESTS.forEach(([param, object, output], i) => {
    const description = `${i + 1}: should sanitize ${util.inspect(object)}` +
      ` to ${util.inspect(output)}`
    it(description, function () {
      expect(sanitize(param)(object)).to.deep.equal(output)
    })
  })
})
