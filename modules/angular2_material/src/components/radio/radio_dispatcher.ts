import {Injectable} from 'angular2/core';

/**
 * Class for radio buttons to coordinate unique selection based on name.
 * Indended to be consumed as an Angular service.
 */
@Injectable()
export class MdRadioDispatcher {
  // TODO(jelbourn): Change this to TypeScript syntax when supported.
  listeners_: Function[];

  constructor() {
    this.listeners_ = [];
  }

  /** Notify other nadio buttons that selection for the given name has been set. */
  notify(name: string) {
    this.listeners_.forEach(listener => listener(name));
  }

  /** Listen for future changes to radio button selection. */
  listen(listener) {
    this.listeners_.push(listener);
  }
}
