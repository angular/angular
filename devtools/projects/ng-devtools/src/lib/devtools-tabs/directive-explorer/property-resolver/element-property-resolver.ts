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
  Descriptor,
  DirectivePosition,
  DirectivesProperties,
  Events,
  MessageBus,
} from '../../../../../../protocol';

import {IndexedNode} from '../directive-forest/index-forest';

import {DirectivePropertyResolver} from './directive-property-resolver';

export interface FlatNode {
  expandable: boolean;
  prop: Property;
  level: number;
}

export interface Property {
  name: string;
  descriptor: Descriptor;
  parent: Property | null;
}

@Injectable()
export class ElementPropertyResolver {
  private _directivePropertiesController = new Map<string, DirectivePropertyResolver>();

  constructor(private _messageBus: MessageBus<Events>) {}

  clearProperties(): void {
    this._directivePropertiesController = new Map();
  }

  setProperties(indexedNode: IndexedNode, data: DirectivesProperties): void {
    this._flushDeletedProperties(data);

    Object.keys(data).forEach((key) => {
      const controller = this._directivePropertiesController.get(key);
      if (controller) {
        controller.updateProperties(data[key]);
        return;
      }
      const position: DirectivePosition = {
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

  private _flushDeletedProperties(data: DirectivesProperties): void {
    const currentProps = [...this._directivePropertiesController.keys()];
    const incomingProps = new Set(Object.keys(data));
    for (const prop of currentProps) {
      if (!incomingProps.has(prop)) {
        this._directivePropertiesController.delete(prop);
      }
    }
  }

  getExpandedProperties(): ComponentExplorerViewProperties {
    const result: ComponentExplorerViewProperties = {};
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

  getDirectiveController(directive: string): DirectivePropertyResolver | undefined {
    return this._directivePropertiesController.get(directive);
  }
}
