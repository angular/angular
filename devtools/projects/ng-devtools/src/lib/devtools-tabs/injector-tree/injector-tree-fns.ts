/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DevToolsNode, SerializedInjector} from '../../../../../protocol';

import {
  InjectorTreeD3Node,
  InjectorTreeNode,
} from '../dependency-injection/injector-tree-visualizer';

export interface InjectorPath {
  node: DevToolsNode;
  path: SerializedInjector[];
}

export function getInjectorIdsToRootFromNode(node: InjectorTreeD3Node): string[] {
  const ids: string[] = [];
  let currentNode = node;

  while (currentNode) {
    ids.push(currentNode.data.injector.id);
    currentNode = currentNode.parent!;
  }

  return ids;
}

export function generateEdgeIdsFromNodeIds(nodeIds: string[]) {
  const edgeIds: string[] = [];

  for (let i = 0; i < nodeIds.length - 1; i++) {
    edgeIds.push(`${nodeIds[i]}-to-${nodeIds[i + 1]}`);
  }

  return edgeIds;
}

export function equalInjector(a: SerializedInjector, b: SerializedInjector): boolean {
  return a.id === b.id;
}

export function findExistingPath(
  path: InjectorTreeNode[],
  value: SerializedInjector,
): InjectorTreeNode | null {
  return path.find((injector) => equalInjector(injector.injector, value)) || null;
}

export function transformInjectorResolutionPathsIntoTree(
  injectorPaths: InjectorPath[],
): InjectorTreeNode {
  const injectorTree: InjectorTreeNode[] = [];
  const injectorIdToNode = new Map<string, DevToolsNode>();

  for (const {path: injectorPath, node} of injectorPaths) {
    let currentLevel = injectorTree;

    for (const [index, injector] of injectorPath.entries()) {
      if (injector.type === 'element' && index === injectorPath.length - 1) {
        injectorIdToNode.set(injector.id, node);
      }
      let existingPath = findExistingPath(currentLevel, injector);

      if (existingPath) {
        currentLevel = existingPath.children;
        continue;
      }

      const next = {
        injector: injector,
        children: [],
      };
      next.injector.node = injectorIdToNode.get(next.injector.id);
      currentLevel.push(next);
      currentLevel = next.children;
    }
  }

  const hiddenRoot = {
    injector: {name: '', type: 'hidden', id: 'N/A'},
    children: injectorTree,
  };

  return hiddenRoot as any;
}

export function grabInjectorPathsFromDirectiveForest(
  directiveForest: DevToolsNode[],
): InjectorPath[] {
  const injectorPaths: InjectorPath[] = [];

  const grabInjectorPaths = (node: DevToolsNode) => {
    if (node.resolutionPath) {
      injectorPaths.push({node, path: node.resolutionPath.slice().reverse()});
    }

    node.children.forEach((child) => grabInjectorPaths(child));
  };

  for (const directive of directiveForest) {
    grabInjectorPaths(directive);
  }

  return injectorPaths;
}

export function splitInjectorPathsIntoElementAndEnvironmentPaths(injectorPaths: InjectorPath[]): {
  elementPaths: InjectorPath[];
  environmentPaths: InjectorPath[];
  startingElementToEnvironmentPath: Map<string, SerializedInjector[]>;
} {
  const elementPaths: InjectorPath[] = [];
  const environmentPaths: InjectorPath[] = [];
  const startingElementToEnvironmentPath = new Map<string, SerializedInjector[]>();

  injectorPaths.forEach(({node, path}) => {
    // split the path into two paths,
    // one for the element injector and one for the environment injector
    let environmentPath: SerializedInjector[] = [];
    let elementPath: SerializedInjector[] = [];
    const firstElementIndex = path.findIndex((injector) => injector.type === 'element');
    if (firstElementIndex === -1) {
      environmentPath = path;
      elementPath = [];
    } else {
      environmentPath = path.slice(0, firstElementIndex);
      elementPath = path.slice(firstElementIndex);
    }

    elementPaths.push({
      node,
      path: elementPath,
    });

    environmentPaths.push({
      node,
      path: environmentPath,
    });

    if (elementPath[elementPath.length - 1]) {
      // reverse each path to get the paths starting from the starting element
      startingElementToEnvironmentPath.set(
        elementPath[elementPath.length - 1].id,
        environmentPath.slice().reverse(),
      );
    }
  });

  return {
    elementPaths: elementPaths.filter(({path}) =>
      path.every((injector) => injector.type === 'element'),
    ),
    environmentPaths,
    startingElementToEnvironmentPath,
  };
}

const ANGULAR_DIRECTIVES = [
  'NgClass',
  'NgComponentOutlet',
  'NgFor',
  'NgForOf',
  'NgIf',
  'NgOptimizedImage',
  'NgPlural',
  'NgPluralCase',
  'NgStyle',
  'NgSwitch',
  'NgSwitchCase',
  'NgSwitchDefault',
  'NgTemplateOutlet',
  'AbstractFormGroupDirective',
  'CheckboxControlValueAccessor',
  'CheckboxRequiredValidator',
  'DefaultValueAccessor',
  'EmailValidator',
  'FormArrayName',
  'FormControlDirective',
  'FormControlName',
  'FormGroupDirective',
  'FormGroupName',
  'MaxLengthValidator',
  'MaxValidator',
  'MinLengthValidator',
  'MinValidator',
  'NgControlStatus',
  'NgControlStatusGroup',
  'NgForm',
  'NgModel',
  'NgModelGroup',
  'NgSelectOption',
  'NumberValueAccessor',
  'PatternValidator',
  'RadioControlValueAccessor',
  'RangeValueAccessor',
  'RequiredValidator',
  'SelectControlValueAccessor',
  'SelectMultipleControlValueAccessor',
  'RouterLink',
  'RouterLinkActive',
  'RouterLinkWithHref',
  'RouterOutlet',
  'UpgradeComponent',
];

const ignoredAngularInjectors = new Set([
  'Null Injector',
  ...ANGULAR_DIRECTIVES,
  ...ANGULAR_DIRECTIVES.map((directive) => `_${directive}`),
]);

export function filterOutInjectorsWithNoProviders(injectorPaths: InjectorPath[]): InjectorPath[] {
  for (const injectorPath of injectorPaths) {
    injectorPath.path = injectorPath.path.filter(
      ({providers}) => providers === undefined || providers > 0,
    );
  }

  return injectorPaths;
}

export function filterOutAngularInjectors(injectorPaths: InjectorPath[]): InjectorPath[] {
  return injectorPaths.map(({node, path}) => {
    return {node, path: path.filter((injector) => !ignoredAngularInjectors.has(injector.name))};
  });
}
