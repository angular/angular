import {int, isPresent, isBlank, Type, BaseException, stringify} from 'facade/lang';
import {Element} from 'facade/dom';
import {ListWrapper, List, MapWrapper, StringMapWrapper} from 'facade/collection';

import {Parser} from 'change_detection/parser/parser';
import {ClosureMap} from 'change_detection/parser/closure_map';
import {ProtoWatchGroup} from 'change_detection/watch_group';

import {Directive} from '../../annotations/directive';
import {Component} from '../../annotations/component';
import {AnnotatedType} from '../annotated_type';
import {ProtoView, ElementPropertyMemento, DirectivePropertyMemento} from '../view';
import {ProtoElementInjector} from '../element_injector';
import {ElementBinder} from '../element_binder';
import {Reflector} from '../reflector';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

/**
 * Creates the ElementBinders and adds watches to the
 * ProtoWatchGroup.
 *
 * Fills:
 * - CompileElement#inheritedElementBinder
 *
 * Reads:
 * - (in parent) CompileElement#inheritedElementBinder
 * - CompileElement#hasBindings
 * - CompileElement#isViewRoot
 * - CompileElement#inheritedViewRoot
 * - CompileElement#inheritedProtoElementInjector
 * - CompileElement#textNodeBindings
 * - CompileElement#propertyBindings
 * - CompileElement#decoratorDirectives
 * - CompileElement#componentDirective
 * - CompileElement#templateDirective
 *
 * Note: This actually only needs the CompileElements with the flags
 * `hasBindings` and `isViewRoot`,
 * and only needs the actual HTMLElement for the ones
 * with the flag `isViewRoot`.
 */
export class ElementBinderBuilder extends CompileStep {
  constructor(parser:Parser, closureMap:ClosureMap) {
    this._parser = parser;
    this._closureMap = closureMap;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var elementBinder;
    if (current.hasBindings) {
      var protoView = current.inheritedProtoView;
      elementBinder = protoView.bindElement(current.inheritedProtoElementInjector);

      if (isPresent(current.textNodeBindings)) {
        this._bindTextNodes(protoView, current.textNodeBindings);
      }
      if (isPresent(current.propertyBindings)) {
        this._bindElementProperties(protoView, current.propertyBindings);
      }
      this._bindDirectiveProperties(this._collectDirectives(current), current);
    } else if (isPresent(parent)) {
      elementBinder = parent.inheritedElementBinder;
    }
    current.inheritedElementBinder = elementBinder;
  }

  _bindTextNodes(protoView, textNodeBindings) {
    MapWrapper.forEach(textNodeBindings, (expression, indexInParent) => {
      protoView.bindTextNode(indexInParent, this._parser.parseBinding(expression));
    });
  }

  _bindElementProperties(protoView, propertyBindings) {
    MapWrapper.forEach(propertyBindings, (expression, property) => {
      protoView.bindElementProperty(property, this._parser.parseBinding(expression));
    });
  }

  _collectDirectives(pipelineElement) {
    var directives;
    if (isPresent(pipelineElement.decoratorDirectives)) {
      directives = ListWrapper.clone(pipelineElement.decoratorDirectives);
    } else {
      directives = [];
    }
    if (isPresent(pipelineElement.templateDirective)) {
      ListWrapper.push(directives, pipelineElement.templateDirective);
    }
    if (isPresent(pipelineElement.componentDirective)) {
      ListWrapper.push(directives, pipelineElement.componentDirective);
    }
    return directives;
  }

  _bindDirectiveProperties(typesWithAnnotations, pipelineElement) {
    var protoView = pipelineElement.inheritedProtoView;
    var directiveIndex = 0;
    ListWrapper.forEach(typesWithAnnotations, (typeWithAnnotation) => {
      var annotation = typeWithAnnotation.annotation;
      if (isBlank(annotation.bind)) {
        return;
      }
      StringMapWrapper.forEach(annotation.bind, (dirProp, elProp) => {
        var expression = isPresent(pipelineElement.propertyBindings) ?
          MapWrapper.get(pipelineElement.propertyBindings, elProp) :
            null;
        if (isBlank(expression)) {
          throw new BaseException('No element binding found for property '+elProp
            +' which is required by directive '+stringify(typeWithAnnotation.type));
        }
        protoView.bindDirectiveProperty(
          directiveIndex++,
          this._parser.parseBinding(expression),
          dirProp,
          this._closureMap.setter(dirProp)
        );
      });
    });
  }
}
