import {ListWrapper, List} from 'facade/collection';
import {humanize} from 'facade/lang';

function constructResolvingPath(keys: List) {
  if (keys.length > 1) {
    var tokenStrs = ListWrapper.map(keys, (k) => humanize(k.token));
    return " (" + tokenStrs.join(' -> ') + ")";
  } else {
    return "";
  }
}

export class NoProviderError extends Error {
  constructor(keys:List){
    this.message = this._constructResolvingMessage(keys);
  }

  _constructResolvingMessage(keys:List) {
    var last = humanize(ListWrapper.last(keys).token);
    return `No provider for ${last}!${constructResolvingPath(keys)}`;
  }

  toString() {
    return this.message;
  }
}

export class AsyncProviderError extends Error {
  constructor(keys:List){
    this.message = this._constructResolvingMessage(keys);
  }

  _constructResolvingMessage(keys:List) {
    var last = humanize(ListWrapper.last(keys).token);
    return `Cannot instantiate ${last} synchronously. ` +
      `It is provided as a future!${constructResolvingPath(keys)}`;
  }

  toString() {
    return this.message;
  }
}

export class InvalidBindingError extends Error {
  constructor(binding){
    this.message = `Invalid binding ${binding}`;
  }

  toString() {
    return this.message;
  }
}