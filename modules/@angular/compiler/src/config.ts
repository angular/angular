import {ViewEncapsulation} from '@angular/core';

import {unimplemented} from '../src/facade/exceptions';
import {Type, isBlank} from '../src/facade/lang';

import {CompileIdentifierMetadata} from './compile_metadata';
import {Identifiers} from './identifiers';

export class CompilerConfig {
  public renderTypes: RenderTypes;
  public defaultEncapsulation: ViewEncapsulation;

  constructor(
      public genDebugInfo: boolean, public logBindingUpdate: boolean, public useJit: boolean,
      renderTypes: RenderTypes = null, defaultEncapsulation: ViewEncapsulation = null,
      public platformDirectives: any[] = [], public platformPipes: any[] = []) {
    if (isBlank(renderTypes)) {
      renderTypes = new DefaultRenderTypes();
    }
    this.renderTypes = renderTypes;
    if (isBlank(defaultEncapsulation)) {
      defaultEncapsulation = ViewEncapsulation.Emulated;
    }
    this.defaultEncapsulation = defaultEncapsulation;
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
  renderText: any /** TODO #9100 */ = null;
  renderElement: any /** TODO #9100 */ = null;
  renderComment: any /** TODO #9100 */ = null;
  renderNode: any /** TODO #9100 */ = null;
  renderEvent: any /** TODO #9100 */ = null;
}
