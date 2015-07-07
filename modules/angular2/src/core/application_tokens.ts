import {OpaqueToken} from 'angular2/di';
import {CONST_EXPR} from 'angular2/src/facade/lang';

/**
 *  @private
 */
export const appComponentRefPromiseToken = CONST_EXPR(new OpaqueToken('Promise<ComponentRef>'));

/**
 * An opaque token representing the application root type in the {@link Injector}.
 *
 * ```
 * @Component(...)
 * @View(...)
 * class MyApp {
 *   ...
 * }
 *
 * bootstrap(MyApp).then((appRef:ApplicationRef) {
 *   expect(appRef.injector.get(appComponentTypeToken)).toEqual(MyApp);
 * });
 *
 * ```
 */
export const appComponentTypeToken = CONST_EXPR(new OpaqueToken('RootComponent'));
