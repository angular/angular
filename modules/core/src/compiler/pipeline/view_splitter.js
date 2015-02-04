import {isBlank, isPresent, BaseException} from 'facade/src/lang';
import {DOM, TemplateElement} from 'facade/src/dom';
import {MapWrapper, ListWrapper} from 'facade/src/collection';

import {Parser} from 'change_detection/change_detection';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';
import {StringWrapper} from 'facade/src/lang';

import {$BANG} from 'change_detection/src/parser/lexer';

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
    if (isBlank(parent)) {
      current.isViewRoot = true;
    } else {
      if (current.element instanceof TemplateElement) {
        if (!current.isViewRoot) {
          var viewRoot = new CompileElement(DOM.createTemplate(''));
          var currentElement:TemplateElement = current.element;
          var viewRootElement:TemplateElement = viewRoot.element;
          this._moveChildNodes(currentElement.content, viewRootElement.content);
          viewRoot.isViewRoot = true;
          control.addChild(viewRoot);
        }
      } else {
        var attrs = current.attrs();
        var templateBindings = MapWrapper.get(attrs, 'template');
        var hasTemplateBinding = isPresent(templateBindings);

        // look for template shortcuts such as !if="condition" and treat them as template="if condition"
        MapWrapper.forEach(attrs, (attrValue, attrName) => {
          if (StringWrapper.charCodeAt(attrName, 0) == $BANG) {
            var key = StringWrapper.substring(attrName, 1);  // remove the bang
            if (hasTemplateBinding) {
              // 2nd template binding detected
              throw new BaseException(`Only one template directive per element is allowed: ` +
                  `${templateBindings} and ${key} cannot be used simultaneously!`);
            } else {
              templateBindings = (attrValue.length == 0) ? key : key + ' ' + attrValue;
              hasTemplateBinding = true;
            }
          }
        });

        if (hasTemplateBinding) {
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
    DOM.insertBefore(currentElement, newParentElement);
    DOM.appendChild(newParentElement, currentElement);
  }

  _parseTemplateBindings(templateBindings:string, compileElement:CompileElement) {
    var bindings = this._parser.parseTemplateBindings(templateBindings, this._compilationUnit);
    for (var i=0; i<bindings.length; i++) {
      var binding = bindings[i];
      if (binding.keyIsVar) {
        compileElement.addVariableBinding(binding.key, binding.name);
      } else if (isPresent(binding.expression)) {
        compileElement.addPropertyBinding(binding.key, binding.expression);
      } else {
        compileElement.element.setAttribute(binding.key, '');
      }
    }
  }
}
