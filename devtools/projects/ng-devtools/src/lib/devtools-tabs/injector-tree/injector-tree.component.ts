/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, ElementRef, inject, NgZone, ViewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ComponentExplorerView, DevToolsNode, Events, MessageBus, SerializedInjector, SerializedProviderRecord} from 'protocol';

import {AngularSplitModule} from '../../vendor/angular-split/public_api';
import {InjectorTreeD3Node, InjectorTreeNode, InjectorTreeVisualizer} from '../dependency-injection/injector-tree-visualizer';
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
    MatExpansionModule, InjectorProvidersComponent, MatIconModule, MatTooltipModule,
    MatCheckboxModule
  ],
  templateUrl: `./injector-tree.component.html`,
  styleUrls: ['./injector-tree.component.scss']
})
export class InjectorTreeComponent {
  @ViewChild('svgContainer', {static: false}) private svgContainer: ElementRef;
  @ViewChild('mainGroup', {static: false}) private g: ElementRef;

  @ViewChild('elementSvgContainer', {static: false}) private elementSvgContainer: ElementRef;
  @ViewChild('elementMainGroup', {static: false}) private elementG: ElementRef;

  private _messageBus = inject(MessageBus) as MessageBus<Events>;
  zone = inject(NgZone);

  firstRender = true;
  selectedNode: InjectorTreeD3Node|null = null;
  rawDirectiveForest: DevToolsNode[] = [];
  injectorTreeGraph: InjectorTreeVisualizer;
  elementInjectorTreeGraph: InjectorTreeVisualizer;
  diDebugAPIsAvailable = false;
  providers: SerializedProviderRecord[] = [];
  elementToEnvironmentPath: Map<string, SerializedInjector[]> = new Map();

  hideInjectorsWithNoProviders = false;
  hideFrameworkInjectors = false;

  ngAfterViewInit() {
    this.setUpEnvironmentInjectorVisualizer();
    this.setUpElementInjectorVisualizer();
  }

  ngOnInit() {
    this._messageBus.on('latestComponentExplorerView', (view: ComponentExplorerView) => {
      if (view.forest[0].resolutionPath !== undefined) {
        this.diDebugAPIsAvailable = true;
        this.rawDirectiveForest = view.forest;
        this.updateInjectorTreeVisualization(view.forest);
      }
    });

    this._messageBus.on(
        'latestInjectorProviders',
        (_: SerializedInjector, providers: SerializedProviderRecord[]) => {
          this.providers = Array.from(providers).sort((a, b) => {
            return a.token.localeCompare(b.token);
          });
        });


    this._messageBus.on('highlightComponent', (id: number) => {
      const injectorNode = this.getNodeByComponentId(this.elementInjectorTreeGraph, id);
      if (injectorNode === null) {
        return;
      }

      this.selectInjectorByNode(injectorNode);
    });
  }

  toggleHideInjectorsWithNoProviders(): void {
    this.hideInjectorsWithNoProviders = !this.hideInjectorsWithNoProviders;
    this.refreshVisualizer();
  }

  toggleHideAngularInjectors(): void {
    this.hideFrameworkInjectors = !this.hideFrameworkInjectors;
    this.refreshVisualizer();
  }

  private refreshVisualizer(): void {
    this.updateInjectorTreeVisualization(this.rawDirectiveForest);

    if (this.selectedNode?.data?.injector?.type === 'environment') {
      this.snapToRoot(this.elementInjectorTreeGraph);
    }

    if (this.selectedNode) {
      this.selectInjectorByNode(this.selectedNode);
    }
  }

  /**
   *
   * Converts the the array of resolution paths for every node in the
   * directive forest into a tree structure that can be rendered by the
   * injector tree visualizer.
   *
   */
  updateInjectorTreeVisualization(forestWithInjectorPaths: DevToolsNode[]): void {
    this.zone.runOutsideAngular(() => {
      // At this point we have a forest of directive trees where each node has a resolution path.
      // We want to convert this nested forest into an array of resolution paths.
      // Our ultimate goal is to convert this array of resolution paths into a tree structure.
      // Directive forest -> Array of resolution paths -> Tree of resolution paths

      // First, pick out the resolution paths.
      let injectorPaths = grabInjectorPathsFromDirectiveForest(forestWithInjectorPaths);

      if (this.hideFrameworkInjectors) {
        injectorPaths = filterOutAngularInjectors(injectorPaths);
      }

      if (this.hideInjectorsWithNoProviders) {
        injectorPaths = filterOutInjectorsWithNoProviders(injectorPaths);
      }

      // In Angular we have two types of injectors, element injectors and environment injectors.
      // We want to split the resolution paths into two groups, one for each type of injector.
      const {elementPaths, environmentPaths, startingElementToEnvironmentPath} =
          splitInjectorPathsIntoElementAndEnvironmentPaths(injectorPaths);
      this.elementToEnvironmentPath = startingElementToEnvironmentPath;

      // Here for our 2 groups of resolution paths, we want to convert them into a tree structure.
      const elementInjectorTree = transformInjectorResolutionPathsIntoTree(elementPaths);
      const environmentInjectorTree = transformInjectorResolutionPathsIntoTree(environmentPaths);

      this.elementInjectorTreeGraph.render(elementInjectorTree);
      this.elementInjectorTreeGraph.onNodeClick((_, node) => {
        this.selectInjectorByNode(node);
      });

      this.injectorTreeGraph.render(environmentInjectorTree);
      this.injectorTreeGraph.onNodeClick((_, node) => {
        this.selectInjectorByNode(node);
      });

      if (this.firstRender) {
        this.snapToRoot(this.injectorTreeGraph);
        this.snapToRoot(this.elementInjectorTreeGraph);
      }

      this.highlightPathFromSelectedInjector();
      this.firstRender = false;
    });
  }

  snapToRoot(graph: InjectorTreeVisualizer) {
    // wait for CD to run before snapping to root so that svg container can change size.
    setTimeout(() => {
      if (graph.root?.children) {
        graph.snapToNode(graph.root.children[0], 0.7);
      }
    });
  }

  snapToNode(node: InjectorTreeD3Node) {
    // wait for CD to run before snapping to root so that svg container can change size.
    setTimeout(() => {
      if (node.data.injector.type === 'element') {
        this.elementInjectorTreeGraph.snapToNode(node);
      } else if (node.data.injector.type === 'environment') {
        this.injectorTreeGraph.snapToNode(node);
      }
    });
  }

  checkIfSelectedNodeStillExists(): void {
    if (this.selectedNode === null) {
      this.snapToRoot(this.injectorTreeGraph);
      this.snapToRoot(this.elementInjectorTreeGraph);
      return;
    }

    const injector = this.selectedNode.data.injector;

    if (injector.type === 'element') {
      const node = this.elementInjectorTreeGraph.getNodeById(injector.id);
      if (node) {
        this.selectedNode = node;
        return;
      }
    }

    if (injector.type === 'environment') {
      const node = this.injectorTreeGraph.getNodeById(injector.id);
      if (node) {
        this.selectedNode = node;
        return;
      }
    }

    this.selectedNode = null;
    this.snapToRoot(this.injectorTreeGraph);
    this.snapToRoot(this.elementInjectorTreeGraph);
  }

  getNodeByComponentId(graph: InjectorTreeVisualizer, id: number): InjectorTreeD3Node|null {
    const graphElement = graph.graphElement;
    const element = graphElement.querySelector(`.node[data-component-id="${id}"]`);
    if (element === null) {
      return null;
    }

    const injectorId = element.getAttribute('data-id');
    if (injectorId === null) {
      return null;
    }

    return graph.getNodeById(injectorId);
  }

  setUpEnvironmentInjectorVisualizer(): void {
    if (!this.svgContainer?.nativeElement || !this.g?.nativeElement) {
      return;
    }

    this.injectorTreeGraph?.cleanup?.();
    this.injectorTreeGraph =
        new InjectorTreeVisualizer(this.svgContainer.nativeElement, this.g.nativeElement);
  }

  setUpElementInjectorVisualizer(): void {
    if (!this.elementSvgContainer?.nativeElement || !this.elementG?.nativeElement) {
      return;
    }

    this.elementInjectorTreeGraph?.cleanup?.();
    this.elementInjectorTreeGraph = new InjectorTreeVisualizer(
        this.elementSvgContainer.nativeElement, this.elementG.nativeElement,
        {nodeSeparation: () => 1});
  }

  highlightPathFromSelectedInjector(): void {
    this.unhighlightAllEdges(this.elementG);
    this.unhighlightAllNodes(this.elementG);
    this.unhighlightAllEdges(this.g);
    this.unhighlightAllNodes(this.g);

    this.checkIfSelectedNodeStillExists();

    if (this.selectedNode === null) {
      return;
    }

    if (this.selectedNode.data.injector.type === 'element') {
      const idsToRoot = getInjectorIdsToRootFromNode(this.selectedNode);
      idsToRoot.forEach(id => this.highlightNodeById(this.elementG, id));
      const edgeIds = generateEdgeIdsFromNodeIds(idsToRoot);
      edgeIds.forEach((edgeId => this.highlightEdgeById(this.elementG, edgeId)));

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
    if (this.selectedNode!.data.injector.id === id) {
      node.classList.add('selected');
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
    for (const edge of edges) {
      edge.classList.remove('highlighted');
    }
  }

  unhighlightAllNodes(graphElement: ElementRef): void {
    const nodes = graphElement.nativeElement.querySelectorAll('.node');
    for (const node of nodes) {
      node.classList.remove('selected');
      node.classList.remove('highlighted');
    }
  }

  selectInjectorByNode(node: InjectorTreeD3Node): void {
    this.selectedNode = node;
    this.highlightPathFromSelectedInjector();
    this.snapToNode(this.selectedNode);
    this.getProviders();
  }

  getProviders() {
    if (this.selectedNode === null) {
      return;
    }
    const injector = this.selectedNode.data.injector;
    this._messageBus.emit('getInjectorProviders', [{
                            id: injector.id,
                            type: injector.type,
                            name: injector.name,
                          }]);
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
    InjectorTreeNode {
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

export function grabInjectorPathsFromDirectiveForest(directiveForest: DevToolsNode[]):
    InjectorPath[] {
  const injectorPaths: InjectorPath[] = [];

  const grabInjectorPaths = (node) => {
    if (node.resolutionPath) {
      injectorPaths.push({node, path: node.resolutionPath.slice().reverse()});
    }

    node.children.forEach(child => grabInjectorPaths(child));
  };

  for (const directive of directiveForest) {
    grabInjectorPaths(directive);
  }

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

  return {
    elementPaths:
        elementPaths.filter(({path}) => path.every(injector => injector.type === 'element')),
    environmentPaths,
    startingElementToEnvironmentPath
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
  'UpgradeComponent'
];

const ignoredAngularInjectors = new Set([
  'Null Injector', ...ANGULAR_DIRECTIVES, ...ANGULAR_DIRECTIVES.map(directive => `_${directive}`)
]);

export function filterOutInjectorsWithNoProviders(injectorPaths: InjectorPath[]): InjectorPath[] {
  for (const injectorPath of injectorPaths) {
    injectorPath.path =
        injectorPath.path.filter(({providers}) => providers === undefined || providers > 0);
  }

  return injectorPaths;
}

export function filterOutAngularInjectors(injectorPaths: InjectorPath[]): InjectorPath[] {
  return injectorPaths.map(({node, path}) => {
    return {node, path: path.filter(injector => !ignoredAngularInjectors.has(injector.name))};
  });
}
