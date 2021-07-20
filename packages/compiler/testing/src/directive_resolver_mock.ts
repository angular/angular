/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CompileReflector, core, DirectiveResolver} from '@angular/compiler';

/**
 * An implementation of {@link DirectiveResolver} that allows overriding
 * various properties of directives.
 */
export class MockDirectiveResolver extends DirectiveResolver {
  private _directives = new Map<core.Type, core.Directive>();

  constructor(reflector: CompileReflector) {
    super(reflector);
  }

  override resolve(type: core.Type): core.Directive;
  override resolve(type: core.Type, throwIfNotFound: true): core.Directive;
  override resolve(type: core.Type, throwIfNotFound: boolean): core.Directive|null;
  override resolve(type: core.Type, throwIfNotFound = true): core.Directive|null {
    return this._directives.get(type) || super.resolve(type, throwIfNotFound);
  }

  /**
   * Overrides the {@link core.Directive} for a directive.
   */
  setDirective(type: core.Type, metadata: core.Directive): void {
    this._directives.set(type, metadata);
  }
}
