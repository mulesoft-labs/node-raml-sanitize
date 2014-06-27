/**
 * Convert a value into a boolean.
 *
 * @param  {String}  value
 * @return {Boolean}
 */
var toBoolean = function (value) {
  return [0, false, '', '0', 'false'].indexOf(value) === -1;
};

/**
 * Convert a value into a number. Non-number strings and infinite values will
 * sanitize into `NaN`.
 *
 * @param  {String} value
 * @return {Number}
 */
var toNumber = function (value) {
  return isFinite(value) ? Number(value) : NaN;
};

/**
 * Convert a value into an integer. Use strict sanitization - if something is
 * not an integer, return `NaN`.
 *
 * @param  {String} value
 * @return {Number}
 */
var toInteger = function (value) {
  if (typeof value === 'number') {
    return value % 1 === 0 ? value : NaN;
  }

  return /^[+-]?\d+$/.test(value) ? Number(value) : NaN;
};

/**
 * Convert a value into a date.
 *
 * @param  {String} value
 * @return {Date}
 */
var toDate = function (value) {
  return new Date(value);
};

/**
 * Convert the schema config into a single sanitization function.
 *
 * @param  {Object}   config
 * @param  {Object}   rules
 * @param  {Object}   types
 * @return {Function}
 */
var toSanitization = function (config, rules, types) {
  var fns = [];

  // Push type sanitization first.
  if (typeof types[config.type] === 'function') {
    fns.push(types[config.type]);
  }

  // Iterate over the schema configuration and push sanitization functions into
  // the sanitization array.
  Object.keys(config).filter(function (rule) {
    return rule !== 'type' && rule !== 'repeat' && rule !== 'default';
  }).forEach(function (rule) {
    if (typeof rules[rule] === 'function') {
      fns.push(rules[rule](config[rule], rule, config));
    }
  });

  /**
   * Sanitize a single value using the function chain.
   *
   * @param  {*}      value
   * @param  {String} key
   * @param  {Object} object
   * @return {*}
   */
  var sanitize = function (value, key, object) {
    // Iterate over each of sanitization functions and return a single value.
    fns.forEach(function (fn) {
      value = fn(value, key, object);
    });

    return value;
  };

  /**
   * Pass in a value to be sanitized.
   *
   * @param  {*}      value
   * @param  {String} key
   * @param  {Object} object
   * @return {*}
   */
  return function sanitization (value, key, object) {
    // Immediately return empty values with attempting to sanitize.
    if (value == null) {
      // Fallback to providing the default value instead.
      if (config.default != null) {
        return sanitization(config.default, key, object);
      }

      // Return an empty array for repeatable values.
      return config.repeat ? [] : value;
    }

    // Support repeated parameters as arrays.
    if (config.repeat) {
      // Convert the value into array when needed.
      if (!Array.isArray(value)) {
        value = [value];
      }

      return value.map(function (value) {
        return sanitize(value, key, object);
      });
    }

    return sanitize(value, key, object);
  };
};

/**
 * Every time the module is exported and executed, we return a new instance.
 *
 * @return {Function}
 */
module.exports = function () {
  /**
   * Return a sanitization function based on the passed in schema.
   *
   * @param  {Object}   schema
   * @return {Function}
   */
  var sanitize = function (schema) {
    var sanitizations = {};

    // Map each parameter in the schema to a validation function.
    Object.keys(schema).forEach(function (param) {
      var config = schema[param];
      var types  = sanitize.TYPES;
      var rules  = sanitize.RULES;

      sanitizations[param] = toSanitization(config, rules, types);
    });

    /**
     * Execute the returned function with a model to return a sanitized object.
     *
     * @param  {Object} model
     * @return {Object}
     */
    return function (model) {
      model = model || {};

      // Create a new model instance to be sanitized without any additional
      // properties or overrides occuring.
      var sanitized = {};

      // Iterate only the sanitized parameters to get a clean model.
      Object.keys(sanitizations).forEach(function (param) {
        var value    = model[param];
        var sanitize = sanitizations[param];

        // Ensure the value is a direct property on the model object before
        // sanitizing. The keeps model handling in sync with expectations.
        if (Object.prototype.hasOwnProperty.call(model, param)) {
          sanitized[param] = sanitize(value, param, model);
        }
      });

      return sanitized;
    };
  };

  /**
   * Provide sanitization based on types.
   *
   * @type {Object}
   */
  sanitize.TYPES = {
    string:  String,
    number:  toNumber,
    integer: toInteger,
    boolean: toBoolean,
    date:    toDate
  };

  /**
   * Provide sanitization based on rules.
   *
   * @type {Object}
   */
  sanitize.RULES = {};

  return sanitize;
};
