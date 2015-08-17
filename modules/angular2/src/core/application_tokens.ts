import {OpaqueToken} from 'angular2/di';
import {CONST_EXPR} from 'angular2/src/facade/lang';

/**
 *  @private
 */
export const APP_COMPONENT_REF_PROMISE = CONST_EXPR(new OpaqueToken('Promise<ComponentRef>'));

/**
 * An opaque token representing the application root type in the {@link Injector}.
 *
 * ```
 * @Component(...)
 * @BaseView(...)
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
export const APP_COMPONENT: OpaqueToken = CONST_EXPR(new OpaqueToken('AppComponent'));
