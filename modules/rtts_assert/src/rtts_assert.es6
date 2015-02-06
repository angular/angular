var _global = typeof window === 'object' ? window : global;

// TODO(vojta):
// - extract into multiple files
// - different error types
// - simplify/humanize error messages
// - throw when invalid input (such as odd number of args into assert.argumentTypes)

var POSITION_NAME = ['', '1st', '2nd', '3rd'];
function argPositionName(i) {
  var position = (i / 2) + 1;

  return POSITION_NAME[position] || (position + 'th');
}

var primitives;
var genericType;

if (typeof $traceurRuntime === 'object') {
  primitives = $traceurRuntime.type;
  genericType = $traceurRuntime.genericType;
} else {
  // Allow to work without traceur runtime as well!
  primitives = {
    any: {name: 'any'},
    boolean: {name: 'boolean'},
    number: {name: 'number'},
    string: {name: 'string'},
    symbol: {name: 'symbol'},
    void: {name: 'void'}
  };
  genericType = function(type, args) {
    return {
      type: type,
      args: args
    }
  }
}
Object.keys(primitives).forEach(function(name) {
  primitives[name].__assertName = name;
});

export function proxy(){
}

function assertArgumentTypes(...params) {
  var actual, type;
  var currentArgErrors;
  var errors = [];
  var msg;

  for (var i = 0, l = params.length; i < l; i = i + 2) {
    actual = params[i];
    type = params[i + 1];

    currentArgErrors = [];

    // currentStack = [];
    //

    if (!isType(actual, type, currentArgErrors)) {

      // console.log(JSON.stringify(errors, null, '  '));
      // TODO(vojta): print "an instance of" only if T starts with uppercase.
      errors.push(argPositionName(i) + ' argument has to be an instance of ' + prettyPrint(type) + ', got ' + prettyPrint(actual));
      if (currentArgErrors.length) {
        errors.push(currentArgErrors);
      }
    }
  }

  if (errors.length) {
    throw new Error('Invalid arguments given!\n' + formatErrors(errors));
  }
}

function prettyPrint(value) {
  if (typeof value === 'undefined') {
    return 'undefined';
  }

  if (typeof value === 'string') {
    return '"' + value + '"';
  }

  if (typeof value === 'boolean') {
    return value.toString();
  }

  if (value === null) {
    return 'null';
  }

  if (typeof value === 'object') {
    if (value.__assertName) {
      return value.__assertName;
    }

    if (value.map) {
      return '[' + value.map(prettyPrint).join(', ') + ']';
    }

    var properties = Object.keys(value);
    return '{' + properties.map((p) => p + ': ' + prettyPrint(value[p])).join(', ') + '}';
  }

  return value.__assertName || value.name || value.toString();
}

function isType(value, T, errors) {
  if (T && T.type) {
    // needed for generics.
    // TODO(tbosch): read out T.args and do assertions based on them as well!
    T = T.type;
  }
  if (T === primitives.void) {
    return typeof value === 'undefined';
  }

  if (_isProxy(value)) {
    return true;
  }

  if (T === primitives.any || value === null) {
    return true;
  }

  if (T === primitives.string) {
    return typeof value === 'string';
  }

  if (T === primitives.number) {
    return typeof value === 'number';
  }

  if (T === primitives.boolean) {
    return typeof value === 'boolean';
  }

  // var parentStack = currentStack;
  // currentStack = [];

  // shouldnt this create new stack?
  if (typeof T.assert === 'function') {
    var parentStack = currentStack;
    var isValid;
    currentStack = errors;
    try {
      isValid = T.assert(value) ;
    } catch (e) {
      fail(e.message);
      isValid = false;
    }

    currentStack = parentStack;

    if (typeof isValid === 'undefined') {
      isValid = errors.length === 0;
    }

    return isValid;

    // if (!currentStack.length) {
    //   currentStack = parentStack;
    //   return [];
    // }
    // var res = currentStack;
    // currentStack = parentStack;
    // return ['not instance of ' + prettyPrint(T), res];
  }

  return value instanceof T;

  // if (!(value instanceof T)) {
  //   fail('not instance of ' + prettyPrint(T));
  // }

  // var res = currentStack;
  // currentStack = parentStack;

  // return res;
}

function _isProxy(obj) {
  if (!obj || !obj.constructor || !obj.constructor.annotations) return false;
  return obj.constructor.annotations.filter((a) => a instanceof proxy).length > 0;
}

function formatErrors(errors, indent = '  ') {
  return errors.map((e) => {
    if (typeof e === 'string') return indent + '- ' + e;
    return formatErrors(e, indent + '  ');
  }).join('\n');
}


// assert a type of given value and throw if does not pass
function type(actual, T) {
  var errors = [];
  // currentStack = [];

  if (!isType(actual, T, errors)) {
    // console.log(JSON.stringify(errors, null, '  '));
    // TODO(vojta): print "an instance of" only if T starts with uppercase.
    var msg = 'Expected an instance of ' + prettyPrint(T) + ', got ' + prettyPrint(actual) + '!';
    if (errors.length) {
      msg += '\n' + formatErrors(errors);
    }

    throw new Error(msg);
  }
  return actual;
}

function returnType(actual, T) {
  var errors = [];
  // currentStack = [];

  if (!isType(actual, T, errors)) {
    // console.log(JSON.stringify(errors, null, '  '));
    // TODO(vojta): print "an instance of" only if T starts with uppercase.
    var msg = 'Expected to return an instance of ' + prettyPrint(T) + ', got ' + prettyPrint(actual) + '!';
    if (errors.length) {
      msg += '\n' + formatErrors(errors);
    }

    throw new Error(msg);
  }

  return actual;
}

// `int` is not a valid JS type, and traceur will leave
// it untouched. However, we want to be able to use it,
// so we provide it as a global
var intType = _global['int'] = define('int', function(value) {
  return typeof value === 'number' && value%1 === 0;
});

// TODO(vojta): define these with DSL?
var string = type.string = define('string', function(value) {
  return typeof value === 'string';
});

var boolean = type.boolean = define('boolean', function(value) {
  return typeof value === 'boolean';
});

var number = type.number = define('number', function(value) {
  return typeof value === 'number';
});

function arrayOf(...types) {
  return assert.define('array of ' + types.map(prettyPrint).join('/'), function(value) {
    if (assert(value).is(Array)) {
      for (var item of value) {
        assert(item).is(...types);
      }
    }
  });
}

function structure(definition) {
  var properties = Object.keys(definition);
  return assert.define('object with properties ' + properties.join(', '), function(value) {
    if (assert(value).is(Object)) {
      for (var property of properties) {
        assert(value[property]).is(definition[property]);
      }
    }
  })
}



// I'm sorry, bad global state... to make the API nice ;-)
var currentStack = [];

function fail(message) {
  currentStack.push(message);
}

function define(classOrName, check) {
  var cls = classOrName;

  if (typeof classOrName === 'string') {
    cls = function() {};
    cls.__assertName = classOrName;
  }

  cls.assert = function(value) {
    // var parentStack = currentStack;

    // currentStack = [];

    return check(value);

    // if (currentStack.length) {
    //   parentStack.push(currentStack)
    // }
    // currentStack = parentStack;
  };

  return cls;
}



function assert(value) {
  return {
    is: function is(...types) {
      // var errors = []
      var allErrors = [];
      var errors;

      for (var type of types) {
        errors = [];

        if (isType(value, type, errors)) {
          return true;
        }

        // if no errors, merge multiple "is not instance of " into x/y/z ?
        allErrors.push(prettyPrint(value) + ' is not instance of ' + prettyPrint(type))
        if (errors.length) {
          allErrors.push(errors);
        }
      }

      // if (types.length > 1) {
      //   currentStack.push(['has to be ' + types.map(prettyPrint).join(' or '), ...allErrors]);
      // } else {
        currentStack.push(...allErrors);
      // }
      return false;
    }
  };
}


// PUBLIC API

// asserting API

// throw if no type provided
assert.type = type;
for (var prop in primitives) {
  assert.type[prop] = primitives[prop];
}
assert.genericType = genericType;

// throw if odd number of args
assert.argumentTypes = assertArgumentTypes;
assert.returnType = returnType;


// define AP;
assert.define = define;
assert.fail = fail;

// primitive value type;
assert.string = string;
assert.number = number;
assert.boolean = boolean;
assert.int = intType;

// custom types
assert.arrayOf = arrayOf;
assert.structure = structure;


export {assert}
