/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Injectable} from '@angular/core';
import {DirectivePropertyResolver} from './directive-property-resolver';
let ElementPropertyResolver = class ElementPropertyResolver {
  constructor(_messageBus) {
    this._messageBus = _messageBus;
    this._directivePropertiesController = new Map();
  }
  clearProperties() {
    this._directivePropertiesController = new Map();
  }
  setProperties(indexedNode, data) {
    this._flushDeletedProperties(data);
    Object.keys(data).forEach((key) => {
      const controller = this._directivePropertiesController.get(key);
      if (controller) {
        controller.updateProperties(data[key]);
        return;
      }
      const position = {
        element: indexedNode.position,
        directive: undefined,
      };
      if (!indexedNode.component || indexedNode.component.name !== key) {
        position.directive = indexedNode.directives.findIndex((d) => d.name === key);
      }
      this._directivePropertiesController.set(
        key,
        new DirectivePropertyResolver(this._messageBus, data[key], position),
      );
    });
  }
  _flushDeletedProperties(data) {
    const currentProps = [...this._directivePropertiesController.keys()];
    const incomingProps = new Set(Object.keys(data));
    for (const prop of currentProps) {
      if (!incomingProps.has(prop)) {
        this._directivePropertiesController.delete(prop);
      }
    }
  }
  getExpandedProperties() {
    const result = {};
    for (const [directive] of this._directivePropertiesController) {
      const controller = this._directivePropertiesController.get(directive);
      if (!controller) {
        console.error('Unable to find nested properties controller for', directive);
        continue;
      }
      result[directive] = controller.getExpandedProperties();
    }
    return result;
  }
  getDirectiveController(directive) {
    return this._directivePropertiesController.get(directive);
  }
};
ElementPropertyResolver = __decorate([Injectable()], ElementPropertyResolver);
export {ElementPropertyResolver};
//# sourceMappingURL=element-property-resolver.js.map
