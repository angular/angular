/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {afterNextRender, Component, ElementRef, inject, ViewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTabsModule} from '@angular/material/tabs';
import {ComponentExplorerView, DevToolsNode, Events, MessageBus, SerializedInjector, SerializedProviderRecord} from 'protocol';

import {AngularSplitModule} from '../../vendor/angular-split/public_api';
import {D3GraphRenderer, InjectorTreeD3Node, InjectorTreeNode, InjectorTreeVisualizer} from '../dependency-injection/injector-tree-visualizer';
import {ResolutionPathComponent} from '../dependency-injection/resolution-path.component';

import {InjectorProvidersComponent} from './injector-providers.component';

export interface InjectorPath {
  node: DevToolsNode;
  path: SerializedInjector[];
}

@Component({
  standalone: true,
  selector: 'ng-injector-tree',
  imports: [
    CommonModule, MatButtonModule, AngularSplitModule, ResolutionPathComponent, MatTabsModule,
    MatExpansionModule, InjectorProvidersComponent
  ],
  templateUrl: `./injector-tree.component.html`,
  styleUrls: ['./injector-tree.component.scss']
})
export class InjectorTreeComponent {
  @ViewChild('svgContainer', {static: false}) private svgContainer: ElementRef;
  @ViewChild('mainGroup', {static: false}) private g: ElementRef;

  @ViewChild('elementSvgContainer', {static: false}) private elementSvgContainer: ElementRef;
  @ViewChild('elementMainGroup', {static: false}) private elementG: ElementRef;

  constructor(private _messageBus: MessageBus<Events>) {
    afterNextRender(() => {
      this.setUpEnvironmentInjectorVisualizer();
      this.setUpElementInjectorVisualizer();
    });
  }

  selectedNode: InjectorTreeD3Node|null = null;
  injectorTreeGraph: InjectorTreeVisualizer;
  elementInjectorTreeGraph: InjectorTreeVisualizer;
  diDebugAPIsAvailable = false;
  providers: SerializedProviderRecord[] = [];
  elementToEnvironmentPath: Map<string, SerializedInjector[]> = new Map();

  ngOnInit() {
    this._messageBus.on('latestComponentExplorerView', (view: ComponentExplorerView) => {
      if (view.forest[0].resolutionPath !== undefined) {
        this.diDebugAPIsAvailable = true;
        this.updateInjectorTreeVisualization(view.forest);
      }
    });

    this._messageBus.on(
        'latestInjectorProviders',
        (_: SerializedInjector, providers: SerializedProviderRecord[]) => {
          this.providers = providers.sort((a, b) => {
            const aIsInjectionToken = a.token.startsWith('InjectionToken');
            const bIsInjectionToken = b.token.startsWith('InjectionToken');
            if (aIsInjectionToken && !bIsInjectionToken) {
              return 1;
            }
            if (!aIsInjectionToken && bIsInjectionToken) {
              return -1;
            }
            return 0;
          });
        });
  }

  /**
   *
   * Converts the the array of resolution paths for every node in the
   * directive forest into a tree structure that can be rendered by the
   * injector tree visualizer.
   *
   */
  updateInjectorTreeVisualization(forestWithInjectorPaths: DevToolsNode[]): void {
    // At this point we have a forest of directive trees where each node has a resolution path.
    // We want to convert this nested forest into an array of resolution paths.
    // Our ultimate goal is to convert this array of resolution paths into a tree structure.
    // Directive forest -> Array of resolution paths -> Tree of resolution paths

    // First, pick out the resolution paths.
    let injectorPaths = grabInjectorPathsFromDirectiveForest(forestWithInjectorPaths);
    injectorPaths = filterOutAngularInjectors(injectorPaths);

    // In Angular we have two types of injectors, element injectors and environment injectors.
    // We want to split the resolution paths into two groups, one for each type of injector.
    const {elementPaths, environmentPaths, startingElementToEnvironmentPath} =
        splitInjectorPathsIntoElementAndEnvironmentPaths(injectorPaths);
    this.elementToEnvironmentPath = startingElementToEnvironmentPath;

    // Here for our 2 groups of resolution paths, we want to convert them into a tree structure.
    const elementInjectorTree = transformInjectorResolutionPathsIntoTree(elementPaths);
    const environmentInjectorTree = transformInjectorResolutionPathsIntoTree(environmentPaths);

    this.elementInjectorTreeGraph.render(elementInjectorTree);
    this.elementInjectorTreeGraph.onInjectorClick((_, node) => {
      this.selectInjectorByNode(node);
    });

    this.injectorTreeGraph.render(environmentInjectorTree);
    this.injectorTreeGraph.onInjectorClick((_, node) => {
      this.selectInjectorByNode(node);
    });

    this.checkIfSelectedNodeStillExists();
    this.highlightPathFromSelectedInjector();
  }

  checkIfSelectedNodeStillExists(): void {
    if (this.selectedNode === null) {
      return;
    }

    const injector = this.selectedNode.data.injector;

    if (injector.type === 'element') {
      if (this.elementG.nativeElement.querySelector(`.node[data-id="${injector.id}"]`)) {
        return;
      }
    }

    if (injector.type === 'environment') {
      if (this.g.nativeElement.querySelector(
              `.node[data-id="${this.selectedNode.data.injector.id}"]`)) {
        return;
      }
    }

    this.selectedNode = null;
  }

  setUpEnvironmentInjectorVisualizer(): void {
    if (!this.svgContainer?.nativeElement || !this.g?.nativeElement) {
      return;
    }

    this.injectorTreeGraph?.cleanup?.();
    this.injectorTreeGraph = new InjectorTreeVisualizer(
        new D3GraphRenderer(this.svgContainer.nativeElement, this.g.nativeElement));
  }

  setUpElementInjectorVisualizer(): void {
    if (!this.elementSvgContainer?.nativeElement || !this.elementG?.nativeElement) {
      return;
    }

    this.elementInjectorTreeGraph?.cleanup?.();
    this.elementInjectorTreeGraph = new InjectorTreeVisualizer(
        new D3GraphRenderer(this.elementSvgContainer.nativeElement, this.elementG.nativeElement));
  }

  highlightPathFromSelectedInjector(): void {
    this.unhighlightAllEdges(this.elementG);
    this.unhighlightAllNodes(this.elementG);
    this.unhighlightAllEdges(this.g);
    this.unhighlightAllNodes(this.g);

    if (this.selectedNode === null) {
      return;
    }

    if (this.selectedNode.data.injector.type === 'element') {
      const idsToRoot = getInjectorIdsToRootFromNode(this.selectedNode);
      idsToRoot.forEach(id => this.highlightNodeById(this.elementG, id));
      const edgeIds = generateEdgeIdsFromNodeIds(idsToRoot);
      edgeIds.forEach(edgeId => this.highlightEdgeById(this.elementG, edgeId));

      const environmentPath =
          this.elementToEnvironmentPath.get(this.selectedNode.data.injector.id) ?? [];
      environmentPath.forEach(injector => this.highlightNodeById(this.g, injector.id));
      const environmentEdgeIds =
          generateEdgeIdsFromNodeIds(environmentPath.map(injector => injector.id));
      environmentEdgeIds.forEach(edgeId => this.highlightEdgeById(this.g, edgeId));
    } else {
      const idsToRoot = getInjectorIdsToRootFromNode(this.selectedNode);
      idsToRoot.forEach(id => this.highlightNodeById(this.g, id));
      const edgeIds = generateEdgeIdsFromNodeIds(idsToRoot);
      edgeIds.forEach(edgeId => this.highlightEdgeById(this.g, edgeId));
    }
  }

  highlightNodeById(graphElement: ElementRef, id: string): void {
    const node = graphElement.nativeElement.querySelector(`.node[data-id="${id}"]`);
    if (!node) {
      return;
    }

    node.classList.add('highlighted');
  }

  highlightEdgeById(graphElement: ElementRef, id: string): void {
    const edge = graphElement.nativeElement.querySelector(`.link[data-id="${id}"]`);
    if (!edge) {
      return;
    }

    edge.classList.add('highlighted');
  }

  unhighlightAllEdges(graphElement: ElementRef): void {
    const edges = graphElement.nativeElement.querySelectorAll('.link');
    edges.forEach(edge => edge.classList.remove('highlighted'));
  }

  unhighlightAllNodes(graphElement: ElementRef): void {
    const nodes = graphElement.nativeElement.querySelectorAll('.node');
    nodes.forEach(node => node.classList.remove('highlighted'));
  }

  selectInjectorByNode(node: InjectorTreeD3Node): void {
    this.selectedNode = node;
    this.highlightPathFromSelectedInjector();
    this.getProviders();
  }

  getProviders() {
    if (this.selectedNode === null) {
      return;
    }
    this._messageBus.emit('getInjectorProviders', [this.selectedNode.data.injector]);
  }
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
    path: InjectorTreeNode[], value: SerializedInjector): InjectorTreeNode|null {
  return path.find(injector => equalInjector(injector.injector, value)) || null;
}

export function transformInjectorResolutionPathsIntoTree(injectorPaths: InjectorPath[]):
    InjectorTreeNode[] {
  const injectorTree: InjectorTreeNode[] = [];

  for (const {path, node} of injectorPaths) {
    let currentLevel = injectorTree;

    for (const injector of path) {
      if (injector['type'] === 'Element') {
        injector.node = node;
      }
      let existingPath = findExistingPath(currentLevel, injector);

      if (existingPath) {
        currentLevel = existingPath.children;
        continue;
      }

      currentLevel.push({
        injector: injector,
        children: [],
      });

      currentLevel = currentLevel[currentLevel.length - 1].children;
    }
  }

  return injectorTree;
}

export function grabInjectorPathsFromDirectiveForest(directiveForest: DevToolsNode[]):
    InjectorPath[] {
  const injectorPaths: InjectorPath[] = [];
  const grabInjectorPaths = (node) => {
    if (node.resolutionPath) {
      injectorPaths.push({node, path: node.resolutionPath.slice().reverse()});
    }

    node.children.forEach(child => grabInjectorPaths(child));
  };
  grabInjectorPaths(directiveForest[0]);
  return injectorPaths;
}

export function splitInjectorPathsIntoElementAndEnvironmentPaths(injectorPaths: InjectorPath[]): {
  elementPaths: InjectorPath[]; environmentPaths: InjectorPath[];
  startingElementToEnvironmentPath: Map<string, SerializedInjector[]>;
} {
  const elementPaths: InjectorPath[] = [];
  const environmentPaths: InjectorPath[] = [];
  const startingElementToEnvironmentPath = new Map<string, SerializedInjector[]>();

  injectorPaths.forEach(({node, path}) => {
    const firstElementIndex = path.findIndex(injector => injector.type === 'element');

    // split the path into two paths,
    // one for the element injector and one for the environment injector
    const environmentPath = path.slice(0, firstElementIndex);
    const elementPath = path.slice(firstElementIndex);

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
          elementPath[elementPath.length - 1].id, environmentPath.slice().reverse());
    }
  });

  return {elementPaths, environmentPaths, startingElementToEnvironmentPath};
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
  'UpgradeComponent'
];

const ignoredAngularInjectors = new Set([
  'Null Injector', 'Platform: core', ...ANGULAR_DIRECTIVES,
  ...ANGULAR_DIRECTIVES.map(directive => `_${directive}`)
]);

export function filterOutAngularInjectors(injectorPaths: InjectorPath[]): InjectorPath[] {
  return injectorPaths.map(({node, path}) => {
    return {node, path: path.filter(injector => !ignoredAngularInjectors.has(injector.name))};
  });
}
