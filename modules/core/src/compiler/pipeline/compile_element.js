import {List, Map, ListWrapper, MapWrapper} from 'facade/collection';
import {Element, DOM} from 'facade/dom';
import {int, isBlank, isPresent} from 'facade/lang';
import {AnnotatedType} from '../annotated_type';
import {Decorator} from '../../annotations/annotations';
import {Component} from '../../annotations/annotations';
import {Template} from '../../annotations/annotations';
import {ElementBinder} from '../element_binder';
import {ProtoElementInjector} from '../element_injector';
import {ProtoView} from '../view';

import {ASTWithSource} from 'change_detection/parser/ast';

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
  variableBindings:Map;
  decoratorDirectives:List<AnnotatedType>;
  templateDirective:AnnotatedType;
  componentDirective:AnnotatedType;
  isViewRoot:boolean;
  hasBindings:boolean;
  inheritedProtoView:ProtoView;
  inheritedProtoElementInjector:ProtoElementInjector;
  inheritedElementBinder:ElementBinder;
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

  addTextNodeBinding(indexInParent:int, expression:ASTWithSource) {
    if (isBlank(this.textNodeBindings)) {
      this.textNodeBindings = MapWrapper.create();
    }
    MapWrapper.set(this.textNodeBindings, indexInParent, expression);
  }

  addPropertyBinding(property:string, expression:ASTWithSource) {
    if (isBlank(this.propertyBindings)) {
      this.propertyBindings = MapWrapper.create();
    }
    MapWrapper.set(this.propertyBindings, property, expression);
  }

  addVariableBinding(contextName:string, templateName:string) {
    if (isBlank(this.variableBindings)) {
      this.variableBindings = MapWrapper.create();
    }
    MapWrapper.set(this.variableBindings, contextName, templateName);
  }

  addEventBinding(eventName:string, expression:ASTWithSource) {
    if (isBlank(this.eventBindings)) {
      this.eventBindings = MapWrapper.create();
    }
    MapWrapper.set(this.eventBindings, eventName, expression);
  }

  addDirective(directive:AnnotatedType) {
    var annotation = directive.annotation;
    if (annotation instanceof Decorator) {
      if (isBlank(this.decoratorDirectives)) {
        this.decoratorDirectives = ListWrapper.create();
      }
      ListWrapper.push(this.decoratorDirectives, directive);
    } else if (annotation instanceof Template) {
      this.templateDirective = directive;
    } else if (annotation instanceof Component) {
      this.componentDirective = directive;
    }
  }
}
