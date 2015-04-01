import {List, Map, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {int, isBlank, isPresent, Type, StringJoiner, assertionsEnabled} from 'angular2/src/facade/lang';
import {DirectiveMetadata} from '../directive_metadata';
import {Decorator, Component, Viewport, DynamicComponent} from '../../annotations/annotations';
import {ElementBinder} from '../element_binder';
import {ProtoElementInjector} from '../element_injector';
import * as viewModule from '../view';
import {dashCaseToCamelCase} from '../string_utils';

import {AST} from 'angular2/change_detection';

/**
 * Collects all data that is needed to process an element
 * in the compile process. Fields are filled
 * by the CompileSteps starting out with the pure HTMLElement.
 */
export class CompileElement {
  element;
  _attrs:Map;
  _classList:List;
  textNodeBindings:Map;
  propertyBindings:Map;
  eventBindings:Map;
  attributes:Map;

  /// Store directive name to template name mapping.
  /// Directive name is what the directive exports the variable as
  /// Template name is how it is reffered to it in template
  variableBindings:Map;
  decoratorDirectives:List<DirectiveMetadata>;
  viewportDirective:DirectiveMetadata;
  componentDirective:DirectiveMetadata;
  hasNestedView:boolean;
  _allDirectives:List<DirectiveMetadata>;
  isViewRoot:boolean;
  hasBindings:boolean;
  inheritedProtoView:viewModule.ProtoView;
  inheritedProtoElementInjector:ProtoElementInjector;
  inheritedElementBinder:ElementBinder;
  distanceToParentInjector:int;
  distanceToParentBinder:int;
  compileChildren: boolean;
  ignoreBindings: boolean;
  elementDescription: string; // e.g. '<div [class]="foo">' : used to provide context in case of error
  contentTagSelector: string;

  constructor(element, compilationUnit = '') {
    this.element = element;
    this._attrs = null;
    this._classList = null;
    this.textNodeBindings = null;
    this.propertyBindings = null;
    this.eventBindings = null;
    this.variableBindings = null;
    this.decoratorDirectives = null;
    this.viewportDirective = null;
    this.componentDirective = null;
    this.hasNestedView = false;
    this._allDirectives = null;
    this.isViewRoot = false;
    this.hasBindings = false;
    // inherited down to children if they don't have
    // an own protoView
    this.inheritedProtoView = null;
    // inherited down to children if they don't have
    // an own protoElementInjector
    this.inheritedProtoElementInjector = null;
    // inherited down to children if they don't have
    // an own elementBinder
    this.inheritedElementBinder = null;
    this.distanceToParentInjector = 0;
    this.distanceToParentBinder = 0;
    this.compileChildren = true;
    // set to true to ignore all the bindings on the element
    this.ignoreBindings = false;
    this.contentTagSelector = null;
    // description is calculated here as compilation steps may change the element
    var tplDesc = getElementDescription(element);
    if (compilationUnit !== '') {
      this.elementDescription = compilationUnit;
      if (isPresent(tplDesc)) this.elementDescription += ": " + tplDesc;
    } else {
      this.elementDescription = tplDesc;
    }
  }

  refreshAttrs() {
    this._attrs = null;
  }

  attrs():Map<string,string> {
    if (isBlank(this._attrs)) {
      this._attrs = DOM.attributeMap(this.element);
    }
    return this._attrs;
  }

  refreshClassList() {
    this._classList = null;
  }

  classList():List<string> {
    if (isBlank(this._classList)) {
      this._classList = ListWrapper.create();
      var elClassList = DOM.classList(this.element);
      for (var i = 0; i < elClassList.length; i++) {
        ListWrapper.push(this._classList, elClassList[i]);
      }
    }
    return this._classList;
  }

  addTextNodeBinding(indexInParent:int, expression:AST) {
    if (isBlank(this.textNodeBindings)) {
      this.textNodeBindings = MapWrapper.create();
    }
    MapWrapper.set(this.textNodeBindings, indexInParent, expression);
  }

  addPropertyBinding(property:string, expression:AST) {
    if (isBlank(this.propertyBindings)) {
      this.propertyBindings = MapWrapper.create();
    }
    MapWrapper.set(this.propertyBindings, dashCaseToCamelCase(property), expression);
  }

  addVariableBinding(variableName:string, variableValue:string) {
    if (isBlank(this.variableBindings)) {
      this.variableBindings = MapWrapper.create();
    }

    // Store the variable map from value to variable, reflecting how it will be used later by
    // View. When a local is set to the view, a lookup for the variable name will take place keyed
    // by the "value", or exported identifier. For example, ng-repeat sets a view local of "index".
    // When this occurs, a lookup keyed by "index" must occur to find if there is a var referencing
    // it.
    MapWrapper.set(this.variableBindings, variableValue, dashCaseToCamelCase(variableName));
  }

  addEventBinding(eventName:string, expression:AST) {
    if (isBlank(this.eventBindings)) {
      this.eventBindings = MapWrapper.create();
    }
    MapWrapper.set(this.eventBindings, eventName, expression);
  }

  addAttribute(attributeName:string, attributeValue:string) {
    if (isBlank(this.attributes)) {
      this.attributes = MapWrapper.create();
    }
    MapWrapper.set(this.attributes, attributeName, attributeValue);
  }

  addDirective(directive:DirectiveMetadata) {
    var annotation = directive.annotation;
    this._allDirectives = null;
    if (annotation instanceof Decorator) {
      if (isBlank(this.decoratorDirectives)) {
        this.decoratorDirectives = ListWrapper.create();
      }
      ListWrapper.push(this.decoratorDirectives, directive);
      if (!annotation.compileChildren) {
        this.compileChildren = false;
      }
    } else if (annotation instanceof Viewport) {
      this.viewportDirective = directive;
    } else if (annotation instanceof Component) {
      this.componentDirective = directive;
      this.hasNestedView = true;
    } else if (annotation instanceof DynamicComponent) {
      this.componentDirective = directive;
    }
  }

  getAllDirectives(): List<DirectiveMetadata> {
    if (this._allDirectives === null) {
      // Collect all the directives
      // When present the component directive must be first
      var directives = ListWrapper.create();
      if (isPresent(this.componentDirective)) {
        ListWrapper.push(directives, this.componentDirective);
      }
      if (isPresent(this.viewportDirective)) {
        ListWrapper.push(directives, this.viewportDirective);
      }
      if (isPresent(this.decoratorDirectives)) {
        directives = ListWrapper.concat(directives, this.decoratorDirectives);
      }
      this._allDirectives = directives;
    }
    return this._allDirectives;
  }
}

// return an HTML representation of an element start tag - without its content
// this is used to give contextual information in case of errors
function getElementDescription(domElement):string {
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


function addDescriptionAttribute(buffer:StringJoiner, attName:string, attValue) {
  if (isPresent(attValue)) {
      if (attValue.length === 0) {
          buffer.add(' ' + attName);
      } else {
          buffer.add(' ' + attName + '="' + attValue + '"');
      }
  }
}
