/**
 * @fileoverview Interface for a logger used to log user interaction via
 * jsactions.
 */

import {ActionFlow} from './/actionflow';

/** Creates a no-op ActionLogger. */
export class ActionLogger {

  /**
   * Logs when an action is actually dispatched. Should be invoked by handler
   * before the action is actually handled.
   *
   * @param actionFlow The action flow for the action.
   * @param info optional string to identify information on the controller that
   *     handles the action.
   */
  logDispatch(actionFlow: ActionFlow, info?: string) {}
}
