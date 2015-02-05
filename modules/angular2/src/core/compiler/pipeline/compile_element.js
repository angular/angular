import {List, Map, ListWrapper, MapWrapper} from 'facade/src/collection';
import {Element, DOM} from 'facade/src/dom';
import {int, isBlank, isPresent, Type} from 'facade/src/lang';
import {DirectiveMetadata} from '../directive_metadata';
import {Decorator} from '../../annotations/annotations';
import {Component} from '../../annotations/annotations';
import {Template} from '../../annotations/annotations';
import {ElementBinder} from '../element_binder';
import {ProtoElementInjector} from '../element_injector';
import {ProtoView} from '../view';

import {AST} from 'change_detection/change_detection';

/**
 * Collects all data that is needed to process an element
 * in the compile process. Fields are filled
 * by the CompileSteps starting out with the pure HTMLElement.
 */
export class CompileElement {
  element:Element;
  _attrs:Map;
  _classList:List;
  textNodeBindings:Map;
  propertyBindings:Map;
  eventBindings:Map;

  /// Store directive name to template name mapping.
  /// Directive name is what the directive exports the variable as
  /// Template name is how it is reffered to it in template
  variableBindings:Map;
  decoratorDirectives:List<DirectiveMetadata>;
  templateDirective:DirectiveMetadata;
  componentDirective:DirectiveMetadata;
  _allDirectives:List<DirectiveMetadata>;
  isViewRoot:boolean;
  hasBindings:boolean;
  inheritedProtoView:ProtoView;
  inheritedProtoElementInjector:ProtoElementInjector;
  inheritedElementBinder:ElementBinder;
  distanceToParentInjector:number;
  compileChildren: boolean;
  constructor(element:Element) {
    this.element = element;
    this._attrs = null;
    this._classList = null;
    this.textNodeBindings = null;
    this.propertyBindings = null;
    this.eventBindings = null;
    this.variableBindings = null;
    this.decoratorDirectives = null;
    this.templateDirective = null;
    this.componentDirective = null;
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
    this.compileChildren = true;
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
    MapWrapper.set(this.propertyBindings, property, expression);
  }

  addVariableBinding(directiveName:string, templateName:string) {
    if (isBlank(this.variableBindings)) {
      this.variableBindings = MapWrapper.create();
    }
    MapWrapper.set(this.variableBindings, templateName, directiveName);
  }

  addEventBinding(eventName:string, expression:AST) {
    if (isBlank(this.eventBindings)) {
      this.eventBindings = MapWrapper.create();
    }
    MapWrapper.set(this.eventBindings, eventName, expression);
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
    } else if (annotation instanceof Template) {
      this.templateDirective = directive;
    } else if (annotation instanceof Component) {
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
      if (isPresent(this.templateDirective)) {
        ListWrapper.push(directives, this.templateDirective);
      }
      if (isPresent(this.decoratorDirectives)) {
        directives = ListWrapper.concat(directives, this.decoratorDirectives);
      }
      this._allDirectives = directives;
    }
    return this._allDirectives;
  }
}
