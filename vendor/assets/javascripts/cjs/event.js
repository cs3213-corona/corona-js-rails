
/**
 * Event.
 * Handles events using the publisher-subscriber design pattern.
 * "Inherited" by all Cjs prototypes.
 */
Cjs._Event = function() {};

/**
 * Triggers an event with a specific name and
 * passes its arguments to all subscribers.
 * @param name Event name.
 * @param args Event arguments.
 */
Cjs._Event.trigger = function(name, args) {
  if(!_.isString(name)) {
    Cjs._log('Cjs.Event', 'Invalid parameter - name, string expected.');
    return;
  }

  // Ignore if does not exist
  if(!this._events)
    return;
  if(!this._events[name])
    return;

  Cjs._log('Cjs.Event', 'Triggered an event "' + name + '".');

  // Trigger all subscribers
  var event = this._events[name];
  for(var i=0; i<event.length; ++i) {
    event[i].func(args);
  }
};

/**
 * Subscribes a function to trigger when event with a specific name
 * is triggered. The subscriber function can be a string, which would
 * then be assumed to be a function binded to the subscriber object.
 * @param name Event name.
 * @param func Subscriber function.
 * @param obj Subscriber object to bind to.
 */
Cjs._Event.subscribe = function(name, func, obj) {
  if(!_.isString(name)) {
    Cjs._log('Cjs.Event', 'Invalid parameter - name, string expected.');
    return;
  }

  // Convert string to function
  if(_.isString(func)) {
    if(_.isUndefined(obj)) {
      Cjs._log('Cjs.Event', 'Invalid parameter - obj, object expected.');
      return;
    }

    // Bind to object
    func = obj[func];
    if(_.isFunction(func))
      func = _.bind(func, obj);
  }

  if(!_.isFunction(func)) {
    Cjs._log('Cjs.Event', 'Invalid parameter - func, function expected.');
    return;
  }

  Cjs._log('Cjs.Event', 'Subscribed to "' + name + '".');

  // Create if does not exist
  if(!this._events)
    this._events = {};
  if(!this._events[name])
    this._events[name] = [];

  // Add subscription to event
  this._events[name].push({func: func});
};

/**
 * Unsubscribes a function with a specific name. The subscriber
 * function can be a string, which would then be assumed to be
 * a function binded to the subscriber object.
 * @param name Event name.
 * @param func Subscriber function.
 * @param obj Subscriber object to bind to.
 */
Cjs._Event.unsubscribe = function(name, func, obj) {
  if(!_.isString(name)) {
    Cjs._log('Cjs.Event', 'Invalid parameter - name, string expected.');
    return;
  }

  // Convert string to function
  if(_.isString(func)) {
    if(_.isUndefined(obj)) {
      Cjs._log('Cjs.Event', 'Invalid parameter - obj, object expected.');
      return;
    }

    // Bind to object
    func = obj[func];
    if(_.isFunction(func))
      func = _.bind(func, obj);
  }

  if(!_.isFunction(func)) {
    Cjs._log('Cjs.Event', 'Invalid parameter - func, function expected.');
    return;
  }

  if(!this._events)
    return;
  if(!this._events[name])
    return;

  Cjs._log('Cjs.Event', 'Unsubscribed to "' + name + '".');

  // Find and remove all instances of the subscriber
  var event = this._events[name];
  for(var i=0; i<event.length; ++i) {
    if(event[i].func == func)
      event.splice(i--, 1);
  }
};
