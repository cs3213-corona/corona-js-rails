
/**
 * Model.
 * Represents a single row in the database table.
 */
Cjs._Model = function() {};

/**
 * Default values will be automatically set
 * upon object creation or when reset() is called.
 */
Cjs._Model.defaults = {};

/**
 * Initialize method that is called upon construction.
 * This functionality can be overridden.
 */
Cjs._Model.init = function() {
};

/**
 * Fetches the model data at the specified URL using a GET request.
 * Triggers:
 * - fetchSuccess: model
 * - fetchFailure: model, textStatus, errorThrown
 * @param url The URL address to fetch the model data at.
 */
Cjs._Model.fetch = function(url) {
  if(!_.isString(url)) {
    Cjs._log('Cjs.Model', 'Invalid parameter - url, string expected.');
    return;
  }

  Cjs._log('Cjs.Model', 'Fetching model @ "' + url + '".');

  // GET request
  var that = this;
  var request = $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    async: true
  });

  // try
  request.done(function(response, status, jqXHR) {
    // Overwrite the existing model
    that.reset();
    that.set(response);
    that.trigger('fetchSuccess', that);
  });

  // catch
  request.fail(function(jqXHR, status, error) {
    that.trigger('fetchFailure', that, status, error);
  });
};

/**
 * Creates the model data at the specified URL using a POST request.
 * Triggers:
 * - createSuccess: model
 * - createFailure: model, textStatus, errorThrown
 * @param url The URL address to create the model data at.
 * @param json JSON data. If none specified, uses the model by default.
 */
Cjs._Model.create = function(url, json) {
  if(!_.isString(url)) {
    Cjs._log('Cjs.Model', 'Invalid parameter - url, string expected.');
    return;
  }

  Cjs._log('Cjs.Model', 'Creating model @ "' + url + '".');

  // Replace with model if no JSON data found
  if(_.isUndefined(json))
    json = this.json();

  // POST request
  var that = this;
  var request = $.ajax({
    url: url,
    type: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(json),
    processData: false,
    async: true
  });

  // try
  request.done(function(response, status, jqXHR) {
    that.trigger('createSuccess', that);
  });

  // catch
  request.fail(function(jqXHR, status, error) {
    that.trigger('createFailure', that, status, error);
  });
};

/**
 * Updates the model data at the specified URL using a PUT request.
 * Triggers:
 * - updateSuccess: model
 * - updateFailure: model, textStatus, errorThrown
 * @param url The URL address to create the model data at.
 * @param json JSON data. If none specified, uses the model by default.
 */
Cjs._Model.update = function(url, json) {
  if(!_.isString(url)) {
    Cjs._log('Cjs.Model', 'Invalid parameter - url, string expected.');
    return;
  }

  Cjs._log('Cjs.Model', 'Updating model @ "' + url + '".');

  // Replace with model if no JSON data found
  if(_.isUndefined(json))
    json = this.json();

  // PUT request
  var that = this;
  var request = $.ajax({
    url: url,
    type: 'PUT',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(json),
    processData: false,
    async: true
  });

  // try
  request.done(function(response, status, jqXHR) {
    that.trigger('updateSuccess', that);
  });

  // catch
  request.fail(function(jqXHR, status, error) {
    that.trigger('updateFailure', that, status, error);
  });
};

/**
 * Destroys the model data at the specified URL using a DELETE request.
 * Triggers:
 * - destroySuccess: model
 * - destroyFailure: model, textStatus, errorThrown
 * @param url The URL address to destroy the model data at.
 * @param json JSON data. Not used if not specified.
 */
Cjs._Model.destroy = function(url, json) {
  if(!_.isString(url)) {
    Cjs._log('Cjs.Model', 'Invalid parameter - url, string expected.');
    return;
  }

  Cjs._log('Cjs.Model', 'Destroying model @ "' + url + '".');

  // DELETE request
  var that = this;
  var request = $.ajax({
    url: url,
    type: 'DELETE',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(json),
    processData: false,
    async: true
  });

  // try
  request.done(function(response, status, jqXHR) {
    that.trigger('destroySuccess', that);
  });

  // catch
  request.fail(function(jqXHR, status, error) {
    that.trigger('destroyFailure', that, status, error);
  });
};

/**
 * Retrieves an attribute value from the model.
 * @param key A string literal acting as attribute key.
 * @return Attribute value.
 */
Cjs._Model.get = function(key) {
  if(!_.isString(key)) {
    Cjs._log('Cjs.Model', 'Invalid parameter - key, string expected.');
    return undefined;
  }
  return this.attributes[key];
};

/**
 * Adds the attributes to the model. When there is a
 * duplicate key, new keys will overwrite old keys.
 * Triggers:
 * - changed: model, attributes
 * @param attributes A JavaScript object containing key-value pairs.
 */
Cjs._Model.set = function(attributes) {
  var that = this;
  _.each(attributes, function(value, key) {
    that.attributes[key] = value;
  });
  this.trigger('changed', this, attributes);
};

/**
 * Clears the model attributes and sets it to its defaults.
 * Triggers:
 * - reset: model
 * - changed: model, defaults
 */
Cjs._Model.reset = function() {
  this.attributes = {};
  this.trigger('reset', this);
  this.set(this.defaults);
};

/**
 * Converts the model into a JSON object.
 */
Cjs._Model.json = function() {
  return this.attributes;
};

/**
 * Converts the model into a JSON string.
 * This is equivalent to JSON.stringify(json()).
 */
Cjs._Model.stringify = function() {
  return JSON.stringify(this.json());
};

/**
 * Public constructor.
 * @param attributes Adds to attributes. Equivalent to calling set(attributes) after construction.
 * @param properties Extended properties for this instance.
 */
Cjs.Model = function(attributes, properties) {
  // Extended properties
  if(!_.isUndefined(properties)) {
    var that = this;
    _.each(properties, function(value, key) {
      that[key] = value;
    });
  }

  this.reset();
  if(!_.isUndefined(attributes))
    this.set(attributes);

  // Ignore first two arguments
  Cjs._shift.apply(arguments);
  Cjs._shift.apply(arguments);
  this.init.apply(this, arguments);
};

// Mount implementation details
_.extend(Cjs.Model.prototype, Cjs._Model, Cjs._Event);
Cjs.Model.extend = Cjs._extend;
