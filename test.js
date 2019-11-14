/* global describe, it */
const util = require('util')
const expect = require('chai').expect
const sanitize = require('./')()
const domain = require('webapi-parser').model.domain

const TYPES = {
  string: 'http://www.w3.org/2001/XMLSchema#string',
  number: 'http://a.ml/vocabularies/shapes#number',
  integer: 'http://www.w3.org/2001/XMLSchema#integer',
  boolean: 'http://www.w3.org/2001/XMLSchema#boolean',
  date: 'http://www.w3.org/2001/XMLSchema#date',
  dateTime: 'http://www.w3.org/2001/XMLSchema#dateTime',
  dateTimeOnly: 'http://a.ml/vocabularies/shapes#dateTimeOnly'
}

function param (shape) {
  return new domain.Parameter().withSchema(shape)
}

const stringArrayUnion = new domain.UnionShape()
  .withName('param')
  .withAnyOf([
    new domain.ScalarShape().withDataType(TYPES.string),
    new domain.ArrayShape()
  ])

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
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.string)),
    { param: null },
    { param: null }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.string)),
    { param: 'test' },
    { param: 'test' }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.string)),
    { param: 123 },
    { param: '123' }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.string)),
    { param: true },
    { param: 'true' }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.string)),
    { param: ['test'] },
    { param: 'test' }
  ],
  /**
   * Number sanitization.
   */
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.number)),
    { param: null },
    { param: null }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.number)),
    { param: 123 },
    { param: 123 }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.number)),
    { param: '123.5' },
    { param: 123.5 }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.number)),
    { param: '123' },
    { param: 123 }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.number)),
    { param: Infinity },
    { param: Infinity }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.number)),
    { param: 'abc' },
    { param: 'abc' }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.number)),
    { param: new Array(50).join(5) + '.' + new Array(50).join(5) },
    { param: Number(new Array(50).join(5) + '.' + new Array(50).join(5)) }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.number)),
    { param: '123.5' },
    { param: 123.5 }
  ],
  /**
   * Integer sanitization.
   */
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)),
    { param: null },
    { param: null }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)),
    { param: 123 },
    { param: 123 }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)),
    { param: 123.5 },
    { param: 123.5 }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)),
    { param: '123.5' },
    { param: '123.5' }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)),
    { param: '123' },
    { param: 123 }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)),
    { param: Infinity },
    { param: Infinity }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)),
    { param: new Array(50).join(5) },
    { param: Number(new Array(50).join(5)) }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)),
    { param: ['123'] },
    { param: 123 }
  ],
  /**
   * Date sanitization.
   */
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.date)),
    { param: undefined },
    { param: undefined }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.date)),
    { param: '2015-05-23' },
    { param: new Date('2015-05-23') }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.date)),
    { param: 'abc' },
    { param: 'abc' }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.date)),
    { param: ['2015-05-23'] },
    { param: new Date('2015-05-23') }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTime)),
    { param: undefined },
    { param: undefined }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTime)),
    { param: 'Sun, 28 Feb 2016 16:41:41 GMT' },
    { param: new Date('Sun, 28 Feb 2016 16:41:41 GMT') }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTime)),
    { param: '2016-02-28T16:41:41.090Z' },
    { param: new Date('2016-02-28T16:41:41.090Z') }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTime)),
    { param: 'abc' },
    { param: 'abc' }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTime)),
    { param: ['Sun, 28 Feb 2016 16:41:41 GMT'] },
    { param: new Date('Sun, 28 Feb 2016 16:41:41 GMT') }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTime)),
    { param: ['2016-02-28T16:41:41.090Z'] },
    { param: new Date('2016-02-28T16:41:41.090Z') }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTimeOnly)),
    { param: undefined },
    { param: undefined }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTimeOnly)),
    { param: '2015-07-04T21:00:00' },
    { param: new Date('2015-07-04T21:00:00') }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTimeOnly)),
    { param: 'abc' },
    { param: 'abc' }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.dateTimeOnly)),
    { param: ['2015-07-04T21:00:00'] },
    { param: new Date('2015-07-04T21:00:00') }
  ],
  /**
   * Boolean sanitization.
   */
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: null },
    { param: null }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: '' },
    { param: false }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: 'false' },
    { param: false }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: 'true' },
    { param: true }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: true },
    { param: true }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: false },
    { param: false }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: '0' },
    { param: false }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: '1' },
    { param: true }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: '2' },
    { param: true }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: 'a' },
    { param: true }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.boolean)),
    { param: ['a'] },
    { param: true }
  ],
  /**
   * Array sanitization.
   */
  [
    param(new domain.ArrayShape()),
    { param: null },
    { param: null }
  ],
  [
    param(new domain.ArrayShape()),
    { param: '[]' },
    { param: [] }
  ],
  [
    param(new domain.ArrayShape()),
    { param: '["a"]' },
    { param: ['a'] }
  ],
  [
    param(new domain.ArrayShape()),
    { param: '[a]' },
    { param: '[a]' }
  ],
  [
    param(new domain.ArrayShape()),
    { param: '[1]' },
    { param: [1] }
  ],
  [
    param(new domain.ArrayShape()),
    { param: '["a", 1, true]' },
    { param: ['a', 1, true] }
  ],
  [
    param(new domain.ArrayShape()),
    { param: '["a", 1, tru]' },
    { param: '["a", 1, tru]' }
  ],
  [
    param(new domain.ArrayShape()),
    { param: 123 },
    { param: [123] }
  ],
  [
    param(new domain.ArrayShape()),
    { param: 'foo' },
    { param: ['foo'] }
  ],
  [
    param(new domain.ArrayShape()),
    { param: ['foo'] },
    { param: ['foo'] }
  ],
  [
    param(new domain.ArrayShape()),
    { param: { foo: 'boo' } },
    { param: [{ foo: 'boo' }] }
  ],
  [
    param(new domain.ArrayShape()),
    { param: [123, 456] },
    { param: [123, 456] }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.string)),
    { param: '123' },
    { param: '123' }
  ],
  [
    param(stringArrayUnion),
    { param: '123' },
    { param: '123' }
  ],
  [
    param(stringArrayUnion),
    { param: 123 },
    { param: 123 }
  ],
  [
    param(stringArrayUnion),
    { param: [123, 234] },
    { param: [123, 234] }
  ],
  /**
   * Object sanitization.
   */
  [
    param(new domain.NodeShape().withName('param')),
    { param: null },
    { param: null }
  ],
  [
    param(new domain.NodeShape().withName('param')),
    { param: '{}' },
    { param: {} }
  ],
  [
    param(new domain.NodeShape().withName('param')),
    { param: '{ "foo" :"bar"}' },
    { param: { foo: 'bar' } }
  ],
  [
    param(new domain.NodeShape().withName('param')),
    { param: '{"foo": 1 }' },
    { param: { foo: 1 } }
  ],
  [
    param(new domain.NodeShape().withName('param')),
    { param: '{"foo": true }' },
    { param: { foo: true } }
  ],
  [
    param(new domain.NodeShape().withName('param')),
    { param: '{"foo"}' },
    { param: '{"foo"}' }
  ],
  [
    param(new domain.NodeShape().withName('param')),
    { param: '{"foo" : 1, }' },
    { param: '{"foo" : 1, }' }
  ],
  /**
   * Arrays.
   */
  [
    param(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.boolean))),
    { param: [123, 456] },
    { param: [123, 456] }
  ],
  [
    param(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.integer))),
    {},
    { param: [] }
  ],
  [
    param(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.integer))),
    { param: '5' },
    { param: [5] }
  ],
  [
    param(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.number))),
    { param: '123' },
    { param: [123] }
  ],
  [
    param(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.number))),
    { param: ['123', 'abc'] },
    { param: ['123', 'abc'] }
  ],
  [
    param(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.boolean))),
    { param: ['0', '1', '2'] },
    { param: [false, true, true] }
  ],
  [
    param(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.string))),
    { param: 'abc123' },
    { param: ['abc123'] }
  ],
  /**
   * Default value sanitization.
   */
  [
    param(new domain.ScalarShape().withDataType(TYPES.string)
      .withDefaultValue(new domain.ScalarNode('test', TYPES.string))),
    { param: 'abc' },
    { param: 'abc' }
  ],
  [
    param(new domain.ScalarShape().withDataType(TYPES.string)
      .withDefaultValue(new domain.ScalarNode('test', TYPES.string))),
    { param: null },
    { param: 'test' }
  ],
  [
    param(new domain.ScalarShape().withDataType(TYPES.string)
      .withDefaultValue(new domain.ScalarNode('test', TYPES.string))),
    {},
    { param: 'test' }
  ],
  [
    param(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.string))
      .withDefaultValue(
        new domain.ArrayNode().addMember(
          new domain.ScalarNode('test', TYPES.string)
        )
      )),
    { param: null },
    { param: ['test'] }
  ],
  [
    param(new domain.ScalarShape().withName('param').withDataType(TYPES.integer)
      .withDefaultValue(new domain.ScalarNode(123, TYPES.integer))),
    { param: null },
    { param: 123 }
  ],
  [
    param(new domain.ArrayShape()
      .withName('param')
      .withItems(new domain.ScalarShape().withDataType(TYPES.integer))
      .withDefaultValue(
        new domain.ArrayNode().addMember(
          new domain.ScalarNode(123, TYPES.integer)
        )
      )),
    { param: null },
    { param: [123] }
  ],
  /**
   * Multiple sanitizations.
   */
  [
    param(new domain.NodeShape().withProperties([
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
    ])),
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
    param(new domain.UnionShape()
      .withName('param')
      .withAnyOf([
        new domain.ScalarShape().withDataType(TYPES.integer),
        new domain.ScalarShape().withDataType(TYPES.string)
      ])),
    {
      param: '123'
    },
    {
      param: 123
    }
  ],
  [
    param(new domain.UnionShape()
      .withName('param')
      .withAnyOf([
        new domain.ScalarShape().withDataType(TYPES.integer),
        new domain.ScalarShape().withDataType(TYPES.string)
      ])),
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
