import {CompileStep} from '../compiler/compile_step';
import {CompileElement} from '../compiler/compile_element';
import {CompileControl} from '../compiler/compile_control';
import {ViewDefinition, ViewEncapsulation, ViewType} from '../../api';
import {NG_CONTENT_ELEMENT_NAME, isElementWithTag} from '../util';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {isBlank, isPresent} from 'angular2/src/core/facade/lang';
import {ShadowCss} from './shadow_css';

export class StyleEncapsulator implements CompileStep {
  constructor(private _appId: string, private _view: ViewDefinition,
              private _componentUIDsCache: Map<string, string>) {}

  processElement(parent: CompileElement, current: CompileElement, control: CompileControl) {
    if (isElementWithTag(current.element, NG_CONTENT_ELEMENT_NAME)) {
      current.inheritedProtoView.bindNgContent();
    } else {
      if (this._view.encapsulation === ViewEncapsulation.Emulated) {
        this._processEmulatedScopedElement(current, parent);
      }
    }
  }

  processStyle(style: string): string {
    var encapsulation = this._view.encapsulation;
    if (encapsulation === ViewEncapsulation.Emulated) {
      return this._shimCssForComponent(style, this._view.componentId);
    } else {
      return style;
    }
  }

  _processEmulatedScopedElement(current: CompileElement, parent: CompileElement): void {
    var element = current.element;
    var hostComponentId = this._view.componentId;
    var viewType = current.inheritedProtoView.type;
    // Shim the element as a child of the compiled component
    if (viewType !== ViewType.HOST && isPresent(hostComponentId)) {
      var contentAttribute = getContentAttribute(this._getComponentId(hostComponentId));
      DOM.setAttribute(element, contentAttribute, '');
      // also shim the host
      if (isBlank(parent) && viewType == ViewType.COMPONENT) {
        var hostAttribute = getHostAttribute(this._getComponentId(hostComponentId));
        current.inheritedProtoView.setHostAttribute(hostAttribute, '');
      }
    }
  }

  _shimCssForComponent(cssText: string, componentId: string): string {
    var id = this._getComponentId(componentId);
    var shadowCss = new ShadowCss();
    return shadowCss.shimCssText(cssText, getContentAttribute(id), getHostAttribute(id));
  }

  _getComponentId(componentStringId: string): string {
    var id = this._componentUIDsCache.get(componentStringId);
    if (isBlank(id)) {
      id = `${this._appId}-${this._componentUIDsCache.size}`;
      this._componentUIDsCache.set(componentStringId, id);
    }
    return id;
  }
}

// Return the attribute to be added to the component
function getHostAttribute(compId: string): string {
  return `_nghost-${compId}`;
}

// Returns the attribute to be added on every single element nodes in the component
function getContentAttribute(compId: string): string {
  return `_ngcontent-${compId}`;
}
