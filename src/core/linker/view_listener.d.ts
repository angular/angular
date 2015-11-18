import * as viewModule from './view';
/**
 * Listener for view creation / destruction.
 */
export declare class AppViewListener {
    onViewCreated(view: viewModule.AppView): void;
    onViewDestroyed(view: viewModule.AppView): void;
}
