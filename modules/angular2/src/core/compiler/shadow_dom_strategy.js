import {Type, isBlank, isPresent} from 'angular2/src/facade/lang';
import {DOM, Element, StyleElement} from 'angular2/src/facade/dom';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {View} from './view';
import {Content} from './shadow_dom_emulation/content_tag';
import {LightDom} from './shadow_dom_emulation/light_dom';
import {DirectiveMetadata} from './directive_metadata';
import {shimCssText} from './shadow_dom_emulation/shim_css';

export class ShadowDomStrategy {
  attachTemplate(el:Element, view:View){}
  constructLightDom(lightDomView:View, shadowDomView:View, el:Element){}
  polyfillDirectives():List<Type>{ return null; }
  processTemplate(template: Element, cmpMetadata: DirectiveMetadata) { return null; }
}

export class EmulatedShadowDomStrategy extends ShadowDomStrategy {
  _styleHost: Element;

  constructor(styleHost: Element = null) {
    if (isBlank(styleHost)) {
      styleHost = DOM.defaultDoc().head;
    }
    this._styleHost = styleHost;
  }

  attachTemplate(el:Element, view:View){
    DOM.clearNodes(el);
    moveViewNodesIntoParent(el, view);
  }

  constructLightDom(lightDomView:View, shadowDomView:View, el:Element){
    return new LightDom(lightDomView, shadowDomView, el);
  }

  polyfillDirectives():List<Type> {
    return [Content];
  }

  processTemplate(template: Element, cmpMetadata: DirectiveMetadata) {
    var templateRoot = DOM.templateAwareRoot(template);
    var attrName = cmpMetadata.annotation.selector;

    // Shim CSS for emulated shadow DOM and attach the styles do the document head
    var styles = _detachStyles(templateRoot);
    for (var i = 0; i < styles.length; i++) {
      var style = styles[i];
      var processedCss = shimCssText(DOM.getText(style), attrName);
      DOM.setText(style, processedCss);
    }
    _attachStyles(this._styleHost, styles);

    // Update the DOM to trigger the CSS
    _addAttributeToChildren(templateRoot, attrName);
  }
}

export class NativeShadowDomStrategy extends ShadowDomStrategy {
  attachTemplate(el:Element, view:View){
    moveViewNodesIntoParent(el.createShadowRoot(), view);
  }

  constructLightDom(lightDomView:View, shadowDomView:View, el:Element){
    return null;
  }

  polyfillDirectives():List<Type> {
    return [];
  }

  processTemplate(template: Element, cmpMetadata: DirectiveMetadata) {
    return template;
  }
}

function moveViewNodesIntoParent(parent, view) {
  for (var i = 0; i < view.nodes.length; ++i) {
    DOM.appendChild(parent, view.nodes[i]);
  }
}

// TODO(vicb): union types: el is an Element or a Document Fragment
function _detachStyles(el): List<StyleElement> {
  var nodeList = DOM.querySelectorAll(el, 'style');
  var styles = [];
  for (var i = 0; i < nodeList.length; i++) {
    var style = DOM.remove(nodeList[i]);
    ListWrapper.push(styles, style);
  }
  return styles;
}

// Move the styles as the first children of the template
function _attachStyles(el: Element, styles: List<StyleElement>) {
  var firstChild = DOM.firstChild(el);
  for (var i = styles.length - 1; i >= 0; i--) {
    var style = styles[i];
    if (isPresent(firstChild)) {
      DOM.insertBefore(firstChild, style);
    } else {
      DOM.appendChild(el, style);
    }
    firstChild = style;
  }
}

// TODO(vicb): union types: el is an Element or a Document Fragment
function _addAttributeToChildren(el, attrName:string) {
  // TODO(vicb): currently the code crashes when the attrName is not an el selector
  var children = DOM.querySelectorAll(el, "*");
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    DOM.setAttribute(child, attrName, '');
  }
}
