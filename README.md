# RAML Sanitize

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Greenkeeper badge](https://badges.greenkeeper.io/mulesoft-labs/node-raml-sanitize.svg)](https://greenkeeper.io/)

Strict sanitization of [RAML 0.8 named parameters](https://github.com/raml-org/raml-spec/blob/master/versions/raml-08/raml-08.md#named-parameters) and [RAML 1.0 built-in types](https://github.com/raml-org/raml-spec/blob/master/versions/raml-10/raml-10.md#built-in-types).

## Why?

This module sanitizes values using [webapi-parser](https://github.com/raml-org/webapi-parser) `Parameter`s and `PropertyShape`s. You should use this if you need to convert any request parameters (usually strings) into the corresponding JavaScript types. For example, form request bodies, query parameters and headers all have no concept of types. After running sanitization, you can use [raml-validate](https://github.com/mulesoft/node-raml-validate) to validate the strict values.

## Installation

```shell
npm install raml-sanitize --save
```

## Usage

The module exports a function that needs to be invoked to get a sanitization instance.

```js
const wap = require('webapi-parser').WebApiParser
const sanitize = require('raml-sanitize')()

// returns Array<webapi-parser.PropertyShape>
async function getProperties () {
  const ramlStr = `
    #%RAML 1.0
    title: API with Types
    types:
      User:
        type: object
        properties:
          username: string
          password:  string
          birthday:
            type: date
            default: Mon, 23 Jun 2014 01:19:34 GMT
  `
  const model = await wap.raml10.parse(ramlStr)
  return model.declares[0].properties
}

async function main () {
  // These could also be Array<webapi-parser.Parameter>
  const properties = await getProperties()
  const user = sanitize(properties)
  const requestData = {
    username: 'blakeembrey',
    password: 'hunter2'
  }
  user(requestData)
  // => { username: 'blakeembrey', password: 'hunter2', birthday: new Date('Mon, 23 Jun 2014 01:19:34 GMT') }
}

main()
```

**Module does not currently support [wild-card parameters](https://github.com/raml-org/raml-spec/blob/master/versions/raml-08/raml-08.md#headers) (RAML 0.8) and regular expression patterns in [property declaration](https://github.com/raml-org/raml-spec/blob/master/versions/raml-10/raml-10.md#property-declarations) (RAML 1.0)**

### Type sanitization

The module comes with built-in type sanitization of `string`, `number`, `integer`, `array`, `object`, `date` and `boolean` as well as nested data. To add a new type sanitization, add a new property with the corresponding name to the `sanitize.TYPES` object.

### Rule sanitization

The module can be extended with rule sanitization by adding properties to the `sanitize.RULES` object. A few core rules are implemented by default and can not be overriden - `default` and `type`.

#### Empty values

Empty values are automatically allowed to pass through sanitization. The only values considered to be empty are `undefined` and `null`.

#### Default values

When the value is empty and a `default` value has been provided, it will return the default value instead.

### Caveats

#### Limitations with types (RAML 1.0)

The module does not support some [Type Expressions](https://github.com/raml-org/raml-spec/blob/master/versions/raml-10/raml-10.md#type-expressions) (bi-dimensional array `A[][]` and array of union `(A|B)[]`).

#### Invalid Sanitization

If a sanitization is invalid, the original value will be returned instead.

#### Booleans

Only `false`, `0`, `"false"`, `"0"` and `""` will return `false`. Everything else is considered `true`.

## License

Apache 2.0

[npm-image]: https://img.shields.io/npm/v/raml-sanitize.svg?style=flat
[npm-url]: https://npmjs.org/package/raml-sanitize
[travis-image]: https://img.shields.io/travis/mulesoft-labs/node-raml-sanitize.svg?style=flat
[travis-url]: https://travis-ci.org/mulesoft-labs/node-raml-sanitize
[coveralls-image]: https://img.shields.io/coveralls/mulesoft-labs/node-raml-sanitize.svg?style=flat
[coveralls-url]: https://coveralls.io/r/mulesoft-labs/node-raml-sanitize?branch=master
