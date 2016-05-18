import {Injectable} from '@angular/core';


// Users of the Dispatcher never need to see this type, but TypeScript requires it to be exported.
export type MdRadioDispatcherListener = (id: string, name: string) => void;

/**
 * Class for radio buttons to coordinate unique selection based on name.
 * Intended to be consumed as an Angular service.
 * This service is needed because native radio change events are only fired on the item currently
 * being selected, and we still need to uncheck the previous selection.
 *
 * This service does not *store* any IDs and names because they may change at any time, so it is
 * less error-prone if they are simply passed through when the events occur.
 */
@Injectable()
export class MdRadioDispatcher {
  private _listeners: MdRadioDispatcherListener[] = [];

  /** Notify other radio buttons that selection for the given name has been set. */
  notify(id: string, name: string) {
    for (let listener of this._listeners) {
      listener(id, name);
    }
  }

  /** Listen for future changes to radio button selection. */
  listen(listener: MdRadioDispatcherListener) {
    this._listeners.push(listener);
  }
}
