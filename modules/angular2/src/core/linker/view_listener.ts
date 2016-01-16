import {Injectable} from 'angular2/src/core/di';
import * as viewModule from './view';

/**
 * Listener for view creation / destruction.
 */
@Injectable()
export class AppViewListener {
  onViewCreated(view: viewModule.AppView) {}
  onViewDestroyed(view: viewModule.AppView) {}
}
