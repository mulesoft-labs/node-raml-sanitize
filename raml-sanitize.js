const domain = require('webapi-parser').model.domain

/**
 * Check if a value is empty.
 *
 * @param  {*}       value
 * @return {Boolean}
 */
function isEmpty (value) {
  return value == null
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
  return isFinite(value) ? Number(value) : null
}

/**
 * Convert a value into an integer. Use strict sanitization - if something is
 * not an integer, return `NaN`.
 *
 * @param  {String} value
 * @return {Number}
 */
function toInteger (value) {
  return value % 1 === 0 ? Number(value) : null
}

/**
 * Convert a value into a date.
 *
 * @param  {String} value
 * @return {Date}
 */
function toDate (value) {
  return !isNaN(Date.parse(value)) ? new Date(value) : null
}

/**
 * Convert a value into an array.
 *
 * @param  {String} value
 * @return {Array}
 */
function toArray (value) {
  try {
    value = JSON.parse(value)
  } catch (e) {}
  return Array.isArray(value) ? value : null
}

/**
 * Convert a value into an object.
 *
 * @param  {String} value
 * @return {Object}
 */
function toObject (value) {
  try {
    value = JSON.parse(value)
  } catch (e) {}
  return value.constructor === {}.constructor ? value : null
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
    if (typeof types[config.type] === 'function') {
      fns.push(types[config.type])
    }

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
     * returns an empty value (`null` or `undefined`).
     *
     * @param  {*}      value
     * @param  {String} key
     * @param  {Object} object
     * @return {*}
     */
    function sanitize (value, key, object) {
      // Iterate over each sanitization function and return a single value.
      fns.every(function (fn) {
        value = fn(value, key, object)

        // Break when the value returns `null`.
        return value != null
      })

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

      // Sanitize each element of an array.
      if (config.type === 'array' && config.items) {
        // Turn the result into an array
        if (!Array.isArray(value)) {
          value = [value]
        }
        const sanitizeItem = toSanitization(config.items, rules, types)

        // Map every value to be sanitized into a new array.
        value = value.map(val => sanitizeItem(val, key, object))
        // If any of the values are empty, refuse the sanitization.
        return value.some(isEmpty) ? null : value
      }

      // // Support array inputs.
      // if (Array.isArray(value)) {
      //   if (value.length > 1) {
      //     return null
      //   }

      //   value = value[0]
      // }

      // // Support RAML 1.0 array types for single values.
      // const isTypeAnArray = config.type === 'array'
      // const isValueAnArray = Array.isArray(value)
      // if (isTypeAnArray && !isValueAnArray) {
      //   return [value]
      // }

      return sanitize(value, key, object)
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
      const sanitized = sanitization(value, key, object)

      // If the value is accepted, return it.
      if (sanitized != null) {
        // Assign the sanitized value to the result.
        result = sanitized

        return true
      }

      return false
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
   * @param  {Array<PropertyShape|Parameter>} elements
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
      sanitizations[el.name.value()] = sanitize.rule(el)
    })

    /**
     * Execute the returned function with a model to return a sanitized object.
     *
     * @param  {Object} model
     * @return {Object}
     */
    return function (model) {
      model = model || {}

      // Create a new model instance to sanitize without any extra properties.
      const sanitized = {}

      // Iterate the sanitized parameters to get a clean model.
      Object.keys(sanitizations).forEach(function (param) {
        const value = model[param]
        const sanitize = sanitizations[param]

        if (Object.prototype.hasOwnProperty.call(model, param)) {
          sanitized[param] = sanitize(value, param, model)
        } else {
          const sanitizedValue = sanitize(undefined, param, model)

          // Only set non-null values on the model.
          if (sanitizedValue != null) {
            sanitized[param] = sanitizedValue
          }
        }
      })

      return sanitized
    }
  }

  /**
   * Sanitize a single parameter config.
   *
   * @param  {PropertyShape|Parameter} element
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
 * @type {PropertyShape|Parameter} element
 * @return {Object} - Schema compatible with sanitization.
 */
function elementToSchema (element) {
  const shape = element.schema || element.range || element
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
 * Returns a one-word string representing a shape type.
 *
 * @param  {webapi-parser.AnyShape} shape
 * @return  {string|Array<string>}
 */
function getShapeType (shape) {
  if (shape instanceof domain.ArrayShape) {
    return 'array'
  }
  if (shape instanceof domain.NodeShape) {
    return 'object'
  }
  if (shape instanceof domain.UnionShape) {
    return shape.anyOf.map(getShapeType)
  }
  if (shape instanceof domain.ScalarShape) {
    return shape.dataType.value().split('#').pop()
  }
}
