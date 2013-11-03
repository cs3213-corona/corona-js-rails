
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
 */
Cjs._Event.trigger = function(name) {
  // Keep copy because shift will modify it
  var eventName = name;

  // Ignore first argument
  Cjs._shift.apply(arguments);
  this.triggerEx(eventName, arguments);
};

/**
 * Triggers an event with a specific name and uses its
 * argument array as an Arguments object to pass to all
 * subscribers.
 * @param name Event name.
 * @param args Event args array.
 */
Cjs._Event.triggerEx = function(name, args) {
  if(!_.isString(name)) {
    Cjs._log('Cjs.Event', 'Invalid parameter - name, string expected.');
    return;
  }

  if(!_.isArray(args) && !_.isArguments(args)) {
    Cjs._log('Cjs.Event', 'Invalid parameter - args, array expected.');
    return;
  }

  // Ignore if does not exist
  if(!this._events)
    return;
  if(!this._events[name])
    return;

  // Retrieve event to trigger
  Cjs._log('Cjs.Event', 'Triggered an event "' + name + '".');
  var event = this._events[name];

  // Trigger all subscribers
  for(var i=0; i<event.length; ++i) {
    Cjs._call(event[i].func, args);
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
