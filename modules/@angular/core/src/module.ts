import {AppModule} from './metadata';
import {APPLICATION_COMMON_PROVIDERS} from './application_common_providers';
import {APP_ID, PACKAGE_ROOT_URL} from './application_tokens';
import {ANALYZE_FOR_PRECOMPILE} from './metadata/di';
import {OpaqueToken} from './di/opaque_token';

/**
 * @stable
 */
@AppModule({
  providers: APPLICATION_COMMON_PROVIDERS
})
export class CoreModule {
  /**
   * A DI Token representing a unique string id assigned to the application by Angular and used
   * primarily for prefixing application attributes and CSS styles when
   * {@link ViewEncapsulation#Emulated} is being used.
   *
   * If you need to avoid randomly generated value to be used as an application id, you can provide
   * a custom value via a DI provider <!-- TODO: provider --> configuring the root {@link Injector}
   * using this token.
   * @experimental
   */
  static appId: OpaqueToken = APP_ID;

  /**
   * A token which indicates the root directory of the application
   * @experimental
   */
  static packageRootUrl: OpaqueToken = PACKAGE_ROOT_URL;

  /**
   * This token can be used to create a virtual provider that will populate the
   * `precompile` fields of components and app modules based on its `useValue`.
   * All components that are referenced in the `useValue` value (either directly
   * or in a nested array or map) will be added to the `precompile` property.
   *
   * ### Example
   * The following example shows how the router can populate the `precompile`
   * field of an AppModule based on the router configuration which refers
   * to components.
   *
   * ```typescript
   * // helper function inside the router
   * function provideRoutes(routes) {
   *   return [
   *     {provide: ROUTES, useValue: routes},
   *     {provide: CoreModule.analyzeForPrecompile, useValue: routes, multi: true}
   *   ];
   * }
   *
   * // user code
   * let routes = [
   *   {path: '/root', component: RootComp},
   *   {path: /teams', component: TeamsComp}
   * ];
   *
   * @AppModule({
   *   providers: [provideRoutes(routes)]
   * })
   * class ModuleWithRoutes {}
   * ```
   *
   * @experimental
   */
  static analyzeForPrecompile: OpaqueToken = ANALYZE_FOR_PRECOMPILE;

}
