/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from '@angular/core';
import {
  ComponentExplorerViewProperties,
  DirectivePosition,
  DirectivesProperties,
  Events,
  MessageBus,
} from '../../../../../../protocol';

import {IndexedNode} from '../directive-forest/index-forest';

import {DirectivePropertyResolver} from './directive-property-resolver';

@Injectable()
export class ElementPropertyResolver {
  private directivePropertiesController = new Map<string, DirectivePropertyResolver>();

  constructor(private messageBus: MessageBus<Events>) {}

  clearProperties(): void {
    this.directivePropertiesController = new Map();
  }

  setProperties(indexedNode: IndexedNode, data: DirectivesProperties): void {
    this.flushDeletedProperties(data);

    Object.keys(data).forEach((key) => {
      const controller = this.directivePropertiesController.get(key);
      if (controller) {
        controller.updateProperties(data[key]);
        return;
      }
      const position: DirectivePosition = {
        element: indexedNode.position,
        directive: undefined,
      };
      if (!indexedNode.component || indexedNode.component.name !== key) {
        position.directive = indexedNode.directives?.findIndex((d) => d.name === key) ?? -1;
      }
      this.directivePropertiesController.set(
        key,
        new DirectivePropertyResolver(this.messageBus, data[key], position),
      );
    });
  }

  private flushDeletedProperties(data: DirectivesProperties): void {
    const currentProps = [...this.directivePropertiesController.keys()];
    const incomingProps = new Set(Object.keys(data));
    for (const prop of currentProps) {
      if (!incomingProps.has(prop)) {
        this.directivePropertiesController.delete(prop);
      }
    }
  }

  getExpandedProperties(): ComponentExplorerViewProperties {
    const result: ComponentExplorerViewProperties = {};
    for (const [directive] of this.directivePropertiesController) {
      const controller = this.directivePropertiesController.get(directive);
      if (!controller) {
        console.error('Unable to find nested properties controller for', directive);
        continue;
      }
      result[directive] = controller.getExpandedProperties();
    }
    return result;
  }

  getDirectiveController(directive: string): DirectivePropertyResolver | undefined {
    return this.directivePropertiesController.get(directive);
  }
}
