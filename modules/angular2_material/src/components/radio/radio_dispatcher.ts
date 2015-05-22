import {List, ListWrapper} from 'angular2/src/facade/collection';

/**
 * Class for radio buttons to coordinate unique selection based on name.
 * Indended to be consumed as an Angular service.
 */
export class MdRadioDispatcher {
  // TODO(jelbourn): Change this to TypeScript syntax when supported.
  listeners_: List<Function>;

  constructor() {
    this.listeners_ = [];
  }

  /** Notify other nadio buttons that selection for the given name has been set. */
  notify(name: string) {
    ListWrapper.forEach(this.listeners_, (f) => f(name));
  }

  /** Listen for future changes to radio button selection. */
  listen(listener) {
    ListWrapper.push(this.listeners_, listener);
  }
}
