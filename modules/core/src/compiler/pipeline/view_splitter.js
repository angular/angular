import {isBlank, isPresent} from 'facade/lang';
import {DOM, TemplateElement} from 'facade/dom';
import {MapWrapper, ListWrapper} from 'facade/collection';

import {Parser} from 'change_detection/parser/parser';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

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
 *
 * Fills:
 * - CompileElement#isViewRoot
 * - CompileElement#variableBindings
 * - CompileElement#propertyBindings
 */
export class ViewSplitter extends CompileStep {
  _parser:Parser;
  _compilationUnit:any;
  constructor(parser:Parser, compilationUnit:any) {
    this._parser = parser;
    this._compilationUnit = compilationUnit;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var element = current.element;
    if (isBlank(parent)) {
      current.isViewRoot = true;
    } else {
      if (current.element instanceof TemplateElement) {
        if (!current.isViewRoot) {
          var viewRoot = new CompileElement(DOM.createTemplate(''));
          this._moveChildNodes(current.element.content, viewRoot.element.content);
          viewRoot.isViewRoot = true;
          control.addChild(viewRoot);
        }
      } else {
        var templateBindings = MapWrapper.get(current.attrs(), 'template');
        if (isPresent(templateBindings)) {
          var newParent = new CompileElement(DOM.createTemplate(''));
          current.isViewRoot = true;
          this._parseTemplateBindings(templateBindings, newParent);
          this._addParentElement(current.element, newParent.element);

          control.addParent(newParent);
          current.element.remove();
        }
      }
    }
  }

  _moveChildNodes(source, target) {
    while (isPresent(source.firstChild)) {
      DOM.appendChild(target, source.firstChild);
    }
  }

  _addParentElement(currentElement, newParentElement) {
    DOM.parentElement(currentElement).insertBefore(newParentElement, currentElement);
    DOM.appendChild(newParentElement, currentElement);
  }

  _parseTemplateBindings(templateBindings:string, compileElement:CompileElement) {
    var bindings = this._parser.parseTemplateBindings(templateBindings, this._compilationUnit);
    for (var i=0; i<bindings.length; i++) {
      var binding = bindings[i];
      if (isPresent(binding.name)) {
        compileElement.addVariableBinding(binding.key, binding.name);
      } else if (isPresent(binding.expression)) {
        compileElement.addPropertyBinding(binding.key, binding.expression);
      } else {
        compileElement.element.setAttribute(binding.key, '');
      }
    }
  }
}
