/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewEncapsulation, isDevMode} from '@angular/core';

import {unimplemented} from '../src/facade/exceptions';

import {CompileIdentifierMetadata} from './compile_metadata';
import {Identifiers} from './identifiers';

export class CompilerConfig {
  public renderTypes: RenderTypes;
  public defaultEncapsulation: ViewEncapsulation;
  private _genDebugInfo: boolean;
  private _logBindingUpdate: boolean;
  public useJit: boolean;
  /**
   * @deprecated Providing platform directives via the {@link CompilerConfig} deprecated. Provide
   * platform
   * directives via an {@link AppModule} instead.
   */
  public deprecatedPlatformDirectives: any[];
  /**
   * @deprecated Providing platform pipes via the {@link CompilerConfig} deprecated. Provide
   * platform pipes
   * via an {@link AppModule} instead.
   */
  public deprecatedPlatformPipes: any[];

  constructor(
      {renderTypes = new DefaultRenderTypes(), defaultEncapsulation = ViewEncapsulation.Emulated,
       genDebugInfo, logBindingUpdate, useJit = true, deprecatedPlatformDirectives = [],
       deprecatedPlatformPipes = []}: {
        renderTypes?: RenderTypes,
        defaultEncapsulation?: ViewEncapsulation,
        genDebugInfo?: boolean,
        logBindingUpdate?: boolean,
        useJit?: boolean,
        deprecatedPlatformDirectives?: any[],
        deprecatedPlatformPipes?: any[]
      } = {}) {
    this.renderTypes = renderTypes;
    this.defaultEncapsulation = defaultEncapsulation;
    this._genDebugInfo = genDebugInfo;
    this._logBindingUpdate = logBindingUpdate;
    this.useJit = useJit;
    this.deprecatedPlatformDirectives = deprecatedPlatformDirectives;
    this.deprecatedPlatformPipes = deprecatedPlatformPipes;
  }

  get genDebugInfo(): boolean {
    return this._genDebugInfo === void 0 ? isDevMode() : this._genDebugInfo;
  }
  get logBindingUpdate(): boolean {
    return this._logBindingUpdate === void 0 ? isDevMode() : this._logBindingUpdate;
  }
}

/**
 * Types used for the renderer.
 * Can be replaced to specialize the generated output to a specific renderer
 * to help tree shaking.
 */
export abstract class RenderTypes {
  get renderer(): CompileIdentifierMetadata { return unimplemented(); }
  get renderText(): CompileIdentifierMetadata { return unimplemented(); }
  get renderElement(): CompileIdentifierMetadata { return unimplemented(); }
  get renderComment(): CompileIdentifierMetadata { return unimplemented(); }
  get renderNode(): CompileIdentifierMetadata { return unimplemented(); }
  get renderEvent(): CompileIdentifierMetadata { return unimplemented(); }
}

export class DefaultRenderTypes implements RenderTypes {
  renderer = Identifiers.Renderer;
  renderText: any = null;
  renderElement: any = null;
  renderComment: any = null;
  renderNode: any = null;
  renderEvent: any = null;
}
