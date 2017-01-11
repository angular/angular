import {Injectable, Optional, SkipSelf} from '@angular/core';


// Users of the Dispatcher never need to see this type, but TypeScript requires it to be exported.
export type UniqueSelectionDispatcherListener = (id: string, name: string) => void;

/**
 * Class to coordinate unique selection based on name.
 * Intended to be consumed as an Angular service.
 * This service is needed because native radio change events are only fired on the item currently
 * being selected, and we still need to uncheck the previous selection.
 *
 * This service does not *store* any IDs and names because they may change at any time, so it is
 * less error-prone if they are simply passed through when the events occur.
 */
@Injectable()
export class UniqueSelectionDispatcher {
  private _listeners: UniqueSelectionDispatcherListener[] = [];

  /**
   * Notify other items that selection for the given name has been set.
   * @param id ID of the item.
   * @param name Name of the item.
   */
  notify(id: string, name: string) {
    for (let listener of this._listeners) {
      listener(id, name);
    }
  }

  /** Listen for future changes to item selection. */
  listen(listener: UniqueSelectionDispatcherListener) {
    this._listeners.push(listener);
  }
}

export function UNIQUE_SELECTION_DISPATCHER_PROVIDER_FACTORY(
    parentDispatcher: UniqueSelectionDispatcher) {
  return parentDispatcher || new UniqueSelectionDispatcher();
}

export const UNIQUE_SELECTION_DISPATCHER_PROVIDER = {
  // If there is already a dispatcher available, use that. Otherwise, provide a new one.
  provide: UniqueSelectionDispatcher,
  deps: [[new Optional(), new SkipSelf(), UniqueSelectionDispatcher]],
  useFactory: UNIQUE_SELECTION_DISPATCHER_PROVIDER_FACTORY
};
