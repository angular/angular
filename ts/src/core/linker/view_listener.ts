import {Injectable} from 'angular2/src/core/di';
import {Type} from 'angular2/src/facade/lang';
import * as viewModule from './view';

/**
 * Listener for view creation / destruction.
 */
@Injectable()
export class AppViewListener {
  onViewCreated(view: viewModule.AppView) {}
  onViewDestroyed(view: viewModule.AppView) {}
}

/**
 * Proxy that allows to intercept component view factories.
 * This also works for precompiled templates, if they were
 * generated in development mode.
 */
@Injectable()
export class ViewFactoryProxy {
  getComponentViewFactory(component: Type, originalViewFactory: Function): Function {
    return originalViewFactory;
  }
}
