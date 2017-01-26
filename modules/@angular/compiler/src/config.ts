/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MissingTranslationStrategy, ViewEncapsulation, isDevMode} from '@angular/core';

import {CompileIdentifierMetadata} from './compile_metadata';
import {Identifiers, createIdentifier} from './identifiers';

export class CompilerConfig {
  public renderTypes: RenderTypes;
  public defaultEncapsulation: ViewEncapsulation;
  private _genDebugInfo: boolean;
  private _logBindingUpdate: boolean;
  public useJit: boolean;
  public missingTranslation: MissingTranslationStrategy;

  constructor(
      {renderTypes = new DefaultRenderTypes(), defaultEncapsulation = ViewEncapsulation.Emulated,
       genDebugInfo, logBindingUpdate, useJit = true, missingTranslation}: {
        renderTypes?: RenderTypes,
        defaultEncapsulation?: ViewEncapsulation,
        genDebugInfo?: boolean,
        logBindingUpdate?: boolean,
        useJit?: boolean,
        missingTranslation?: MissingTranslationStrategy,
      } = {}) {
    this.renderTypes = renderTypes;
    this.defaultEncapsulation = defaultEncapsulation;
    this._genDebugInfo = genDebugInfo;
    this._logBindingUpdate = logBindingUpdate;
    this.useJit = useJit;
    this.missingTranslation = missingTranslation;
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
  abstract get renderer(): CompileIdentifierMetadata;
  abstract get renderText(): CompileIdentifierMetadata;
  abstract get renderElement(): CompileIdentifierMetadata;
  abstract get renderComment(): CompileIdentifierMetadata;
  abstract get renderNode(): CompileIdentifierMetadata;
  abstract get renderEvent(): CompileIdentifierMetadata;
}

export class DefaultRenderTypes implements RenderTypes {
  get renderer() { return createIdentifier(Identifiers.Renderer); };
  renderText: any = null;
  renderElement: any = null;
  renderComment: any = null;
  renderNode: any = null;
  renderEvent: any = null;
}
