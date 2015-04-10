import {Key} from './key';
import {ListWrapper, List} from 'angular2/src/facade/collection';
import {stringify} from 'angular2/src/facade/lang';

function findFirstClosedCycle(keys:List<any>) {
  var res = [];
  for(var i = 0; i < keys.length; ++i) {
    if (ListWrapper.contains(res, keys[i])) {
      ListWrapper.push(res, keys[i]);
      return res;
    } else {
      ListWrapper.push(res, keys[i]);
    }
  }
  return res;
}

function constructResolvingPath(keys:List<any>) {
  if (keys.length > 1) {
    var reversed = findFirstClosedCycle(ListWrapper.reversed(keys));
    var tokenStrs = ListWrapper.map(reversed, (k) => stringify(k.token));
    return " (" + tokenStrs.join(' -> ') + ")";
  } else {
    return "";
  }
}

export class BaseError {
  constructor(message?: string) { Error.call(this, message); }
}
BaseError.prototype = Error;

export class KeyMetadataError extends BaseError {}

export class ProviderError extends BaseError {
  message: string;
  keys:List<Key>;
  constructResolvingMessage:Function;
  constructor(key:Key, constructResolvingMessage:Function) {
    super();
    this.keys = [key];
    this.constructResolvingMessage = constructResolvingMessage;
    this.message = this.constructResolvingMessage(this.keys);
  }

  addKey(key: Key) {
    ListWrapper.push(this.keys, key);
    this.message = this.constructResolvingMessage(this.keys);
  }

  toString(): string {
    return this.message;
  }
}

export class NoProviderError extends ProviderError {
  constructor(key: Key) {
    super(key, function (keys:List<Key>) {
      var first = stringify(ListWrapper.first(keys).token);
      return `No provider for ${first}!${constructResolvingPath(keys)}`;
    });
  }
}

export class AsyncBindingError extends ProviderError {
  constructor(key:Key) {
    super(key, function (keys:List<Key>) {
      var first = stringify(ListWrapper.first(keys).token);
      return `Cannot instantiate ${first} synchronously. ` +
        `It is provided as a promise!${constructResolvingPath(keys)}`;
    });
  }
}

export class CyclicDependencyError extends ProviderError {
  constructor(key:Key) {
    super(key, function (keys:List<Key>) {
      return `Cannot instantiate cyclic dependency!${constructResolvingPath(keys)}`;
    });
  }
}

export class InstantiationError extends ProviderError {
  constructor(originalException:Error, key:Key) {
    super(key, function (keys:List<Key>) {
      var first = stringify(ListWrapper.first(keys).token);
      return `Error during instantiation of ${first}!${constructResolvingPath(keys)}.` +
        ` ORIGINAL ERROR: ${originalException}`;
    });
  }
}

export class InvalidBindingError extends BaseError {
  message:string;
  constructor(binding) {
    super();
    this.message = `Invalid binding ${binding}`;
  }

  toString(): string {
    return this.message;
  }
}

export class NoAnnotationError extends BaseError {
  message:string;
  constructor(typeOrFunc) {
    super();
    this.message = `Cannot resolve all parameters for ${stringify(typeOrFunc)}`;
  }

  toString(): string {
    return this.message;
  }
}

