import {Injectable} from 'angular2/core';
import * as viewModule from './view';

/**
 * Listener for view creation / destruction.
 */
@Injectable()
export class AppViewListener {
  viewCreated(view: viewModule.AppView) {}
  viewDestroyed(view: viewModule.AppView) {}
}
