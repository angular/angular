import {isBlank, isPresent, BaseException, StringWrapper} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {Parser} from 'angular2/change_detection';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

import {dashCaseToCamelCase} from '../util';

/**
 * Splits views at `<template>` elements or elements with `template` attribute:
 * For `<template>` elements:
 * - moves the content into a new and disconnected `<template>` element
 *   that is marked as view root.
 *
 * For elements with a `template` attribute:
 * - replaces the element with an empty `<template>` element,
 *   parses the content of the `template` attribute and adds the information to that
 *   `<template>` element. Marks the elements as view root.
 *
 * Note: In both cases the root of the nested view is disconnected from its parent element.
 * This is needed for browsers that don't support the `<template>` element
 * as we want to do locate elements with bindings using `getElementsByClassName` later on,
 * which should not descend into the nested view.
 */
export class ViewSplitter implements CompileStep {
  constructor(public _parser: Parser) {}

  process(parent: CompileElement, current: CompileElement, control: CompileControl) {
    var attrs = current.attrs();
    var templateBindings = MapWrapper.get(attrs, 'template');
    var hasTemplateBinding = isPresent(templateBindings);

    // look for template shortcuts such as *ng-if="condition" and treat them as template="if
    // condition"
    MapWrapper.forEach(attrs, (attrValue, attrName) => {
      if (StringWrapper.startsWith(attrName, '*')) {
        var key = StringWrapper.substring(attrName, 1);  // remove the star
        if (hasTemplateBinding) {
          // 2nd template binding detected
          throw new BaseException(`Only one template directive per element is allowed: ` +
                                  `${templateBindings} and ${key} cannot be used simultaneously ` +
                                  `in ${current.elementDescription}`);
        } else {
          templateBindings = (attrValue.length == 0) ? key : key + ' ' + attrValue;
          hasTemplateBinding = true;
        }
      }
    });

    if (isPresent(parent)) {
      if (DOM.isTemplateElement(current.element)) {
        if (!current.isViewRoot) {
          var viewRoot = new CompileElement(DOM.createTemplate(''));
          viewRoot.inheritedProtoView = current.bindElement().bindNestedProtoView(viewRoot.element);
          // viewRoot doesn't appear in the original template, so we associate
          // the current element description to get a more meaningful message in case of error
          viewRoot.elementDescription = current.elementDescription;
          viewRoot.isViewRoot = true;

          this._moveChildNodes(DOM.content(current.element), DOM.content(viewRoot.element));
          control.addChild(viewRoot);
        }
      }
      if (hasTemplateBinding) {
        var newParent = new CompileElement(DOM.createTemplate(''));
        newParent.inheritedProtoView = current.inheritedProtoView;
        newParent.inheritedElementBinder = current.inheritedElementBinder;
        newParent.distanceToInheritedBinder = current.distanceToInheritedBinder;
        // newParent doesn't appear in the original template, so we associate
        // the current element description to get a more meaningful message in case of error
        newParent.elementDescription = current.elementDescription;

        current.inheritedProtoView = newParent.bindElement().bindNestedProtoView(current.element);
        current.inheritedElementBinder = null;
        current.distanceToInheritedBinder = 0;
        current.isViewRoot = true;
        this._parseTemplateBindings(templateBindings, newParent);

        this._addParentElement(current.element, newParent.element);
        control.addParent(newParent);
        DOM.remove(current.element);
      }
    }
  }

  _moveChildNodes(source, target) {
    var next = DOM.firstChild(source);
    while (isPresent(next)) {
      DOM.appendChild(target, next);
      next = DOM.firstChild(source);
    }
  }

  _addParentElement(currentElement, newParentElement) {
    DOM.insertBefore(currentElement, newParentElement);
    DOM.appendChild(newParentElement, currentElement);
  }

  _parseTemplateBindings(templateBindings: string, compileElement: CompileElement) {
    var bindings =
        this._parser.parseTemplateBindings(templateBindings, compileElement.elementDescription);
    for (var i = 0; i < bindings.length; i++) {
      var binding = bindings[i];
      if (binding.keyIsVar) {
        compileElement.bindElement().bindVariable(dashCaseToCamelCase(binding.key), binding.name);
        MapWrapper.set(compileElement.attrs(), binding.key, binding.name);
      } else if (isPresent(binding.expression)) {
        compileElement.bindElement().bindProperty(dashCaseToCamelCase(binding.key),
                                                  binding.expression);
        MapWrapper.set(compileElement.attrs(), binding.key, binding.expression.source);
      } else {
        DOM.setAttribute(compileElement.element, binding.key, '');
      }
    }
  }
}
