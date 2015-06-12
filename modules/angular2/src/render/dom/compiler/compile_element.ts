import {List, Map, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {isBlank, isPresent, Type, StringJoiner, assertionsEnabled} from 'angular2/src/facade/lang';

import {ProtoViewBuilder, ElementBinderBuilder} from '../view/proto_view_builder';

/**
 * Collects all data that is needed to process an element
 * in the compile process. Fields are filled
 * by the CompileSteps starting out with the pure HTMLElement.
 */
export class CompileElement {
  _attrs: Map<string, string> = null;
  _classList: List<string> = null;
  isViewRoot: boolean = false;
  // inherited down to children if they don't have an own protoView
  inheritedProtoView: ProtoViewBuilder = null;
  distanceToInheritedBinder: number = 0;
  // inherited down to children if they don't have an own elementBinder
  inheritedElementBinder: ElementBinderBuilder = null;
  compileChildren: boolean = true;
  elementDescription: string;  // e.g. '<div [class]="foo">' : used to provide context in case of
                               // error

  constructor(public element, compilationUnit: string = '') {
    // description is calculated here as compilation steps may change the element
    var tplDesc = assertionsEnabled() ? getElementDescription(element) : null;
    if (compilationUnit !== '') {
      this.elementDescription = compilationUnit;
      if (isPresent(tplDesc)) this.elementDescription += ": " + tplDesc;
    } else {
      this.elementDescription = tplDesc;
    }
  }

  isBound() {
    return isPresent(this.inheritedElementBinder) && this.distanceToInheritedBinder === 0;
  }

  bindElement() {
    if (!this.isBound()) {
      var parentBinder = this.inheritedElementBinder;
      this.inheritedElementBinder =
          this.inheritedProtoView.bindElement(this.element, this.elementDescription);
      if (isPresent(parentBinder)) {
        this.inheritedElementBinder.setParent(parentBinder, this.distanceToInheritedBinder);
      }
      this.distanceToInheritedBinder = 0;
    }
    return this.inheritedElementBinder;
  }

  refreshAttrs() { this._attrs = null; }

  attrs(): Map<string, string> {
    if (isBlank(this._attrs)) {
      this._attrs = DOM.attributeMap(this.element);
    }
    return this._attrs;
  }

  refreshClassList() { this._classList = null; }

  classList(): List<string> {
    if (isBlank(this._classList)) {
      this._classList = ListWrapper.create();
      var elClassList = DOM.classList(this.element);
      for (var i = 0; i < elClassList.length; i++) {
        ListWrapper.push(this._classList, elClassList[i]);
      }
    }
    return this._classList;
  }
}

// return an HTML representation of an element start tag - without its content
// this is used to give contextual information in case of errors
function getElementDescription(domElement): string {
  var buf = new StringJoiner();
  var atts = DOM.attributeMap(domElement);

  buf.add("<");
  buf.add(DOM.tagName(domElement).toLowerCase());

  // show id and class first to ease element identification
  addDescriptionAttribute(buf, "id", MapWrapper.get(atts, "id"));
  addDescriptionAttribute(buf, "class", MapWrapper.get(atts, "class"));
  MapWrapper.forEach(atts, (attValue, attName) => {
    if (attName !== "id" && attName !== "class") {
      addDescriptionAttribute(buf, attName, attValue);
    }
  });

  buf.add(">");
  return buf.toString();
}


function addDescriptionAttribute(buffer: StringJoiner, attName: string, attValue) {
  if (isPresent(attValue)) {
    if (attValue.length === 0) {
      buffer.add(' ' + attName);
    } else {
      buffer.add(' ' + attName + '="' + attValue + '"');
    }
  }
}
