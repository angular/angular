/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {RendererStyleFlags3, isProceduralRenderer} from '../interfaces/renderer';
import {StylingRenderer} from '../interfaces/styling';
import {isStylingValueDefined} from '../util/styling_utils';

/**
 * Wrapper used to apply style/class values to the DOM.
 */
export class DomStylingRenderer implements StylingRenderer {
  private _renderer: any = null;

  setCurrentRenderer(renderer: any) { this._renderer = renderer; }

  setClass(element: HTMLElement, className: string, value: boolean, bindingIndex: number|null):
      void {
    if (className !== '') {
      if (value) {
        ngDevMode && ngDevMode.rendererAddClass++;
        if (this._hasRenderer()) {
          this._renderer.addClass(element, className);
        } else {
          // the reason why classList may be `null` is either because
          // it's a container element or it's a part of a test
          // environment that doesn't have styling. In either
          // case it's safe not to apply styling to the element.
          const classList = element.classList;
          if (classList != null) {
            classList.add(className);
          }
        }
      } else {
        ngDevMode && ngDevMode.rendererRemoveClass++;
        if (this._hasRenderer()) {
          this._renderer.removeClass(element, className);
        } else {
          const classList = element.classList;
          if (classList != null) {
            classList.remove(className);
          }
        }
      }
    }
  }

  setStyle(element: HTMLElement, prop: string, value: string|null, bindingIndex: number|null):
      void {
    // Use `isStylingValueDefined` to account for falsy values that should be bound like 0.
    if (isStylingValueDefined(value)) {
      // opacity, z-index and flexbox all have number values
      // and these need to be converted into strings so that
      // they can be assigned properly.
      value = value.toString();
      ngDevMode && ngDevMode.rendererSetStyle++;
      if (this._hasRenderer()) {
        this._renderer.setStyle(element, prop, value, RendererStyleFlags3.DashCase);
      } else {
        // The reason why element style may be `null` is either because
        // it's a container element or it's a part of a test
        // environment that doesn't have styling. In either
        // case it's safe not to apply styling to the element.
        const elementStyle = element.style;
        if (elementStyle != null) {
          elementStyle.setProperty(prop, value);
        }
      }
    } else {
      ngDevMode && ngDevMode.rendererRemoveStyle++;

      if (this._hasRenderer()) {
        this._renderer.removeStyle(element, prop, RendererStyleFlags3.DashCase);
      } else {
        const elementStyle = element.style;
        if (elementStyle != null) {
          elementStyle.removeProperty(prop);
        }
      }
    }
  }

  private _hasRenderer() { return this._renderer && isProceduralRenderer(this._renderer); }
}

let _renderer: DomStylingRenderer|null = null;
export function getStylingRenderer(): StylingRenderer {
  if (!_renderer) {
    _renderer = new DomStylingRenderer();
  }
  return _renderer;
}
