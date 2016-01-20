import { Type } from 'angular2/src/facade/lang';
import * as viewModule from './view';
/**
 * Listener for view creation / destruction.
 */
export declare class AppViewListener {
    onViewCreated(view: viewModule.AppView): void;
    onViewDestroyed(view: viewModule.AppView): void;
}
/**
 * Proxy that allows to intercept component view factories.
 * This also works for precompiled templates, if they were
 * generated in development mode.
 */
export declare class ViewFactoryProxy {
    getComponentViewFactory(component: Type, originalViewFactory: Function): Function;
}
