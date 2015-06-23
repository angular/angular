import {BaseException} from 'angular2/src/facade/lang';
import {ViewRef} from './view_ref';
import {RenderViewRef, RenderElementRef, Renderer} from 'angular2/src/render/api';

/**
 * @exportedAs angular2/view
 */
export class ElementRef implements RenderElementRef {
  constructor(public parentView: ViewRef, public boundElementIndex: number,
              private _renderer: Renderer) {}

  get renderView(): RenderViewRef { return this.parentView.render; }
  // TODO(tbosch): remove this once Typescript supports declaring interfaces
  // that contain getters
  set renderView(viewRef: RenderViewRef) { throw new BaseException('Abstract setter'); }

  /**
   * Exposes the underlying native element.
   * Attention: This won't work in a webworker scenario!
   */
  get nativeElement(): any { return this._renderer.getNativeElementSync(this); }
}
