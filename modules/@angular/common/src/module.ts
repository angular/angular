import {AppModule, OpaqueToken} from '@angular/core';
import {COMMON_PIPES} from './pipes/common_pipes';
import {CORE_DIRECTIVES} from './directives/core_directives';

/**
 * @stable
 */
@AppModule({
  directives: CORE_DIRECTIVES,
  pipes: COMMON_PIPES
})
export class CommonModule {
  /**
   * The `appBaseHref` token represents the base href to be used with the
   * {@link PathLocationStrategy}.
   *
   * If you're using {@link PathLocationStrategy}, you must provide a provider to a string
   * representing the URL prefix that should be preserved when generating and recognizing
   * URLs.
   *
   * ### Example
   *
   * ```
   * import {Component} from '@angular/core';
   * import {CommonModule} from '@angular/common';
   *
   * @Component({...})
   * class AppCmp {
   *   // ...
   * }
   *
   * @AppModule({
   *   provides: [
   *     {provide: CommonModule.appBaseHref, useValue: '/my/app'}
   *   ]
   * })
   * class MyAppModule{}
   * ```
   * @stable
   */
  static appBaseHref = new OpaqueToken('appBaseHref');
}
