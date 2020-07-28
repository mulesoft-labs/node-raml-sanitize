/**
 * Check if a value is empty.
 *
 * @param  {*}       value
 * @return {Boolean}
 */
function isEmpty (value) {
  return value === null || value === undefined
}

/**
 * Convert a value into a boolean.
 *
 * @param  {String}  value
 * @return {Boolean}
 */
function toBoolean (value) {
  return [0, false, '', '0', 'false'].indexOf(value) === -1
}

/**
 * Convert a value into a number. Non-number strings and infinite values will
 * sanitize into `NaN`.
 *
 * @param  {String} value
 * @return {Number}
 */
function toNumber (value) {
  if (isFinite(value)) {
    return Number(value)
  }
  throw new Error('toNumber: value is not finite')
}

/**
 * Convert a value into an integer. Use strict sanitization - if something is
 * not an integer, return `NaN`.
 *
 * @param  {String} value
 * @return {Number}
 */
function toInteger (value) {
  if (value % 1 === 0) {
    return Number(value)
  }
  throw new Error('toInteger: value is not a multiple of 1')
}

/**
 * Convert a value into a date.
 *
 * @param  {String} value
 * @return {Date}
 */
function toDate (value) {
  if (value.constructor === Date) {
    return value
  }
  if (!isNaN(Date.parse(value))) {
    return new Date(value)
  }
  throw new Error('toDate: value is not a parsable date')
}

/**
 * Convert a value into an array.
 *
 * @param  {String} value
 * @return {Array}
 */
function toArray (value) {
  if (Array.isArray(value)) {
    return value
  }
  try {
    value = JSON.parse(value)
  } catch (e) {
    throw new Error(`toArray: ${e.toString()}`)
  }
  if (!Array.isArray(value)) {
    throw new Error('toArray: parsed value is not an array')
  }
  return value
}

/**
 * Convert a value into an object.
 *
 * @param  {String} value
 * @return {Object}
 */
function toObject (value) {
  if (value.constructor === {}.constructor) {
    return value
  }
  try {
    value = JSON.parse(value)
  } catch (e) {
    throw new Error(`toObject: ${e.toString()}`)
  }
  if (value.constructor !== {}.constructor) {
    throw new Error('toObject: parsed value is not an object')
  }
  return value
}

/**
 * Convert the schema config into a single sanitization function.
 *
 * @param  {Object}   configs
 * @param  {Object}   rules
 * @param  {Object}   types
 * @return {Function}
 */
function toSanitization (configs, rules, types) {
  configs = Array.isArray(configs) ? configs : [configs]

  // Map configurations into function sanitization chains.
  const sanitizations = configs.map(function (config) {
    const fns = []

    // Push type sanitization first.
    const isUnion = Array.isArray(config.type)
    const typesNames = isUnion ? config.type : [config.type]
    typesNames.forEach(name => {
      if (typeof types[name] === 'function') {
        fns.push(types[name])
      }
    })

    // Iterate over the schema configuration and push sanitization functions
    // into the sanitization array.
    Object.keys(config)
      .filter(rule => rule !== 'type' && rule !== 'default')
      .forEach(rule => {
        if (typeof rules[rule] === 'function') {
          fns.push(rules[rule](config[rule], rule, config))
        }
      })

    /**
     * Sanitize a single value using the function chain. Breaks when any value
     * sanitization throws an error.
     *
     * @param  {*}      value
     * @param  {String} key
     * @param  {Object} object
     * @return {*}
     */
    function sanitize (value, key, object) {
      // Iterate over each sanitization function and return a single value.
      function fnsRunner (fn) {
        try {
          value = fn(value, key, object)
          return true
        } catch (e) {
          return false
        }
      }
      isUnion ? fns.some(fnsRunner) : fns.every(fnsRunner)
      return value
    }

    /**
     * Do the entire sanitization flow using the current config.
     *
     * @param  {*}      value
     * @param  {String} key
     * @param  {Object} object
     * @return {*}
     */
    return function sanitization (value, key, object) {
      // Immediately return empty values with attempting to sanitize.
      if (isEmpty(value)) {
        // Fallback to providing the default value instead.
        if (config.default !== undefined) {
          return sanitization(config.default, key, object)
        }
        return value
      }

      value = sanitize(value, key, object)

      // Sanitize each element of an array.
      if (config.type === 'array') {
        // Turn the result into an array
        if (!Array.isArray(value)) {
          value = [value]
        }
        if (config.items) {
          const sanitizeItem = toSanitization(config.items, rules, types)

          // Map every value to be sanitized into a new array.
          value = value.map(val => sanitizeItem(val, key, object))
          // If any of the values are empty, refuse the sanitization.
          value = value.some(isEmpty) ? null : value
        }
      }
      return value
    }
  })

  /**
   * Pass in a value to be sanitized.
   *
   * @param  {*}      value
   * @param  {String} key
   * @param  {Object} object
   * @return {*}
   */
  return function (value, key, object) {
    let result = value

    // Iterate over each sanitization until one is not empty.
    sanitizations.some(function (sanitization) {
      result = sanitization(value, key, object)
    })

    return result
  }
}

/**
 * Every time the module executes, we return a new instance.
 *
 * @return {Function}
 */
module.exports = function () {
  /**
   * Return a sanitization function based on the passed shapes.
   * Sanitize a multiple parameters config.
   *
   * @param  {Array.<(webapi-parser.PropertyShape|webapi-parser.Parameter)>} elements
   * @return {Function}
   */
  function sanitize (elements) {
    if (!elements || elements.length < 1) {
      return function () {
        return {}
      }
    }
    elements = Array.isArray(elements) ? elements : [elements]

    const sanitizations = {}

    // Map each parameter in the schema to a validation function.
    elements.forEach(el => {
      const sch = getSchema(el)
      const hasProperties = sch && sch.properties && sch.properties.length > 0
      sanitizations[el.name.value()] = hasProperties
        ? sanitize(sch.properties)
        : sanitize.rule(el)
    })

    /**
     * Execute the returned function with a model to return a sanitized object.
     *
     * @param  {Object} input
     * @return {Object}
     */
    return function (input) {
      input = input || {}

      // Create a new instance to sanitize without any extra properties.
      const sanitized = {}

      // Iterate the sanitized parameters to get a clean input.
      Object.keys(sanitizations).forEach(function (param) {
        const hasField = Object.prototype.hasOwnProperty.call(input, param)
        const value = hasField ? input[param] : null
        const sanValue = sanitizations[param](value, param, input)
        if (hasField || sanValue !== null) {
          sanitized[param] = sanValue
        }
      })

      return sanitized
    }
  }

  /**
   * Sanitize a single parameter config.
   *
   * @param  {(webapi-parser.PropertyShape|webapi-parser.Parameter)} element
   * @return {Function}
   */
  sanitize.rule = function rule (element) {
    const config = elementToSchema(element)
    return toSanitization(config, sanitize.RULES, sanitize.TYPES)
  }

  /**
   * Provide sanitization based on types.
   *
   * @type {Object}
   */
  sanitize.TYPES = {
    string: String,
    number: toNumber,
    integer: toInteger,
    boolean: toBoolean,
    array: toArray,
    object: toObject,
    date: toDate,
    dateTime: toDate,
    dateTimeOnly: toDate
  }

  /**
   * Provide sanitization based on rules.
   *
   * @type {Object}
   */
  sanitize.RULES = {}

  return sanitize
}

/**
 * Converts DomainElement instances to a sanitization schema.
 * Passed elements should have an attached schemas as an AnyShape
 * subclass instance.
 *
 * @type {(webapi-parser.PropertyShape|webapi-parser.Parameter)} element
 * @return {Object} - Schema compatible with sanitization.
 */
function elementToSchema (element) {
  const shape = getSchema(element)
  const required = (
    (element.required && element.required.value()) ||
    (element.minCount && element.minCount > 0))
  const data = {
    name: element.name.value(),
    required: !!required,
    type: getShapeType(shape)
  }
  if (shape.values && shape.values.length > 0) {
    data.enum = shape.values.map(val => val.value.value())
  }
  const extraData = {
    format: shape.format && shape.format.option,
    default: shape.defaultValueStr && shape.defaultValueStr.option,
    minimum: shape.minimum && shape.minimum.option,
    maximum: shape.maximum && shape.maximum.option,
    multipleOf: shape.multipleOf && shape.multipleOf.option,
    minLength: shape.minLength && shape.minLength.option,
    maxLength: shape.maxLength && shape.maxLength.option,
    pattern: shape.pattern && shape.pattern.option
  }
  try {
    extraData.default = JSON.parse(extraData.default)
  } catch (e) {}
  Object.entries(extraData).forEach(([key, val]) => {
    if (val !== null && val !== undefined) {
      data[key] = val
    }
  })
  if (data.type === 'array' && shape.items) {
    data.items = elementToSchema(shape.items)
  }
  return data
}

/**
 * Gets element schema.
 *
 * @type {(webapi-parser.PropertyShape|webapi-parser.Parameter)} element
 * @return {webapi-parser.AnyShape} - Element schema
 */
function getSchema (element) {
  return element.schema || element.range || element
}

/**
 * Returns a one-word string representing a shape type.
 *
 * @param  {webapi-parser.AnyShape} shape
 * @return {string|Array<string>}
 */
function getShapeType (shape) {
  // ScalarShape
  if (shape.dataType !== undefined) {
    return shape.dataType.value().split('#').pop()
  }
  // UnionShape
  if (shape.anyOf !== undefined) {
    return shape.anyOf.map(getShapeType)
  }
  // ArrayShape
  if (shape.items !== undefined) {
    return 'array'
  }
  // NodeShape
  if (shape.properties !== undefined) {
    return 'object'
  }
}
