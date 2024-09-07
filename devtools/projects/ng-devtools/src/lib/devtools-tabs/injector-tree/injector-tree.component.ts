/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  NgZone,
  signal,
  viewChild,
} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatExpansionPanel} from '@angular/material/expansion';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {
  ComponentExplorerView,
  DevToolsNode,
  Events,
  MessageBus,
  SerializedInjector,
  SerializedProviderRecord,
} from 'protocol';

import {SplitAreaDirective, SplitComponent} from '../../vendor/angular-split/public_api';
import {
  InjectorTreeD3Node,
  InjectorTreeVisualizer,
} from '../dependency-injection/injector-tree-visualizer';
import {ResolutionPathComponent} from '../dependency-injection/resolution-path.component';

import {InjectorProvidersComponent} from './injector-providers.component';
import {
  filterOutAngularInjectors,
  filterOutInjectorsWithNoProviders,
  generateEdgeIdsFromNodeIds,
  getInjectorIdsToRootFromNode,
  grabInjectorPathsFromDirectiveForest,
  splitInjectorPathsIntoElementAndEnvironmentPaths,
  transformInjectorResolutionPathsIntoTree,
} from './injector-tree-fns';

@Component({
  selector: 'ng-injector-tree',
  imports: [
    MatButton,
    SplitComponent,
    SplitAreaDirective,
    ResolutionPathComponent,
    MatExpansionPanel,
    InjectorProvidersComponent,
    MatIcon,
    MatTooltip,
    MatCheckbox,
  ],
  templateUrl: `./injector-tree.component.html`,
  styleUrls: ['./injector-tree.component.scss'],
})
export class InjectorTreeComponent {
  private svgContainer = viewChild.required<ElementRef>('svgContainer');
  private g = viewChild.required<ElementRef>('mainGroup');

  private elementSvgContainer = viewChild.required<ElementRef>('elementSvgContainer');
  private elementG = viewChild.required<ElementRef>('elementMainGroup');

  private _messageBus = inject(MessageBus) as MessageBus<Events>;
  zone = inject(NgZone);

  firstRender = true;
  readonly selectedNode = signal<InjectorTreeD3Node | null>(null);
  rawDirectiveForest: DevToolsNode[] = [];
  injectorTreeGraph!: InjectorTreeVisualizer;
  elementInjectorTreeGraph!: InjectorTreeVisualizer;
  readonly diDebugAPIsAvailable = signal(false);
  readonly providers = signal<SerializedProviderRecord[]>([]);
  elementToEnvironmentPath: Map<string, SerializedInjector[]> = new Map();

  hideInjectorsWithNoProviders = false;
  hideFrameworkInjectors = false;

  constructor() {
    afterNextRender({
      write: () => {
        this.init();
        this.setUpEnvironmentInjectorVisualizer();
        this.setUpElementInjectorVisualizer();
      },
    });
  }

  private init() {
    this._messageBus.on('latestComponentExplorerView', (view: ComponentExplorerView) => {
      if (view.forest[0].resolutionPath !== undefined) {
        this.diDebugAPIsAvailable.set(true);
        this.rawDirectiveForest = view.forest;
        this.updateInjectorTreeVisualization(view.forest);
      }
    });

    this._messageBus.on(
      'latestInjectorProviders',
      (_: SerializedInjector, providers: SerializedProviderRecord[]) => {
        this.providers.set(
          Array.from(providers).sort((a, b) => {
            return a.token.localeCompare(b.token);
          }),
        );
      },
    );

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

    if (this.selectedNode()?.data?.injector?.type === 'environment') {
      this.snapToRoot(this.elementInjectorTreeGraph);
    }

    if (this.selectedNode()) {
      this.selectInjectorByNode(this.selectedNode()!);
    }
  }

  /**
   *
   * Converts the array of resolution paths for every node in the
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
    const selectedNode = this.selectedNode();
    if (selectedNode === null) {
      this.snapToRoot(this.injectorTreeGraph);
      this.snapToRoot(this.elementInjectorTreeGraph);
      return;
    }

    const injector = selectedNode.data.injector;

    if (injector.type === 'element') {
      const node = this.elementInjectorTreeGraph.getNodeById(injector.id);
      if (node) {
        this.selectedNode.set(node);
        return;
      }
    }

    if (injector.type === 'environment') {
      const node = this.injectorTreeGraph.getNodeById(injector.id);
      if (node) {
        this.selectedNode.set(node);
        return;
      }
    }

    this.selectedNode.set(null);
    this.snapToRoot(this.injectorTreeGraph);
    this.snapToRoot(this.elementInjectorTreeGraph);
  }

  getNodeByComponentId(graph: InjectorTreeVisualizer, id: number): InjectorTreeD3Node | null {
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
    const svg = this.svgContainer()?.nativeElement;
    const g = this.g()?.nativeElement;
    if (!svg || !g) {
      return;
    }

    this.injectorTreeGraph?.cleanup?.();
    this.injectorTreeGraph = new InjectorTreeVisualizer(svg, g);
  }

  setUpElementInjectorVisualizer(): void {
    const svg = this.elementSvgContainer()?.nativeElement;
    const g = this.elementG()?.nativeElement;
    if (!svg || !g) {
      return;
    }

    this.elementInjectorTreeGraph?.cleanup?.();
    this.elementInjectorTreeGraph = new InjectorTreeVisualizer(svg, g, {nodeSeparation: () => 1});
  }

  highlightPathFromSelectedInjector(): void {
    this.unhighlightAllEdges(this.elementG());
    this.unhighlightAllNodes(this.elementG());
    this.unhighlightAllEdges(this.g());
    this.unhighlightAllNodes(this.g());

    this.checkIfSelectedNodeStillExists();

    if (this.selectedNode() === null) {
      return;
    }

    if (this.selectedNode()!.data.injector.type === 'element') {
      const idsToRoot = getInjectorIdsToRootFromNode(this.selectedNode()!);
      idsToRoot.forEach((id) => this.highlightNodeById(this.elementG(), id));
      const edgeIds = generateEdgeIdsFromNodeIds(idsToRoot);
      edgeIds.forEach((edgeId) => this.highlightEdgeById(this.elementG(), edgeId));

      const environmentPath =
        this.elementToEnvironmentPath.get(this.selectedNode()!.data.injector.id) ?? [];
      environmentPath.forEach((injector) => this.highlightNodeById(this.g(), injector.id));
      const environmentEdgeIds = generateEdgeIdsFromNodeIds(
        environmentPath.map((injector) => injector.id),
      );
      environmentEdgeIds.forEach((edgeId) => this.highlightEdgeById(this.g(), edgeId));
    } else {
      const idsToRoot = getInjectorIdsToRootFromNode(this.selectedNode()!);
      idsToRoot.forEach((id) => this.highlightNodeById(this.g(), id));
      const edgeIds = generateEdgeIdsFromNodeIds(idsToRoot);
      edgeIds.forEach((edgeId) => this.highlightEdgeById(this.g(), edgeId));
    }
  }

  highlightNodeById(graphElement: ElementRef, id: string): void {
    const node = graphElement.nativeElement.querySelector(`.node[data-id="${id}"]`);
    if (!node) {
      return;
    }
    if (this.selectedNode()!.data.injector.id === id) {
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
    this.selectedNode.set(node);
    this.highlightPathFromSelectedInjector();
    this.snapToNode(this.selectedNode()!);
    this.getProviders();
  }

  getProviders() {
    if (this.selectedNode() === null) {
      return;
    }
    const injector = this.selectedNode()!.data.injector;
    this._messageBus.emit('getInjectorProviders', [
      {
        id: injector.id,
        type: injector.type,
        name: injector.name,
      },
    ]);
  }
}
