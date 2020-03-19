import { Injectable } from '@angular/core';
import {
  DirectivesProperties,
  ComponentExplorerViewProperties,
  Descriptor,
  MessageBus,
  Events,
  DirectivePosition,
} from 'protocol';
import { IndexedNode } from '../directive-forest/index-forest';
import { DirectivePropertyResolver } from './directive-property-resolver';

export interface FlatNode {
  expandable: boolean;
  prop: Property;
  level: number;
}

export interface Property {
  name: string;
  descriptor: Descriptor;
  parent: Property;
}

@Injectable()
export class ElementPropertyResolver {
  private _directivePropertiesController = new Map<string, DirectivePropertyResolver>();

  constructor(private _messageBus: MessageBus<Events>) {}

  setProperties(indexedNode: IndexedNode, data: DirectivesProperties): void {
    this._directivePropertiesController = new Map<string, DirectivePropertyResolver>();
    Object.keys(data).forEach(key => {
      const position: DirectivePosition = {
        element: indexedNode.position,
        directive: undefined,
      };
      if (!indexedNode.component || indexedNode.component.name !== key) {
        position.directive = indexedNode.directives.findIndex(d => d.name === key);
      }
      this._directivePropertiesController.set(
        key,
        new DirectivePropertyResolver(this._messageBus, data[key], position)
      );
    });
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
    return {} as any;
  }

  getDirectiveController(directive: string): DirectivePropertyResolver | undefined {
    return this._directivePropertiesController.get(directive);
  }
}
