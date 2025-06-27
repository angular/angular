/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  NgZone,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {
  ComponentExplorerView,
  DevToolsNode,
  Events,
  MessageBus,
  SerializedInjector,
  SerializedProviderRecord,
} from '../../../../../protocol';

import {SplitAreaDirective, SplitComponent} from '../../vendor/angular-split/public_api';
import {TreeVisualizer} from '../../shared/tree-visualizer-host/tree-visualizer';
import {TreeVisualizerHostComponent} from '../../shared/tree-visualizer-host/tree-visualizer-host.component';
import {InjectorProvidersComponent} from './injector-providers/injector-providers.component';
import {
  d3InjectorTreeLinkModifier,
  d3InjectorTreeNodeModifier,
  filterOutAngularInjectors,
  filterOutInjectorsWithNoProviders,
  generateEdgeIdsFromNodeIds,
  getInjectorIdsToRootFromNode,
  grabInjectorPathsFromDirectiveForest,
  InjectorTreeD3Node,
  InjectorTreeVisualizer,
  splitInjectorPathsIntoElementAndEnvironmentPaths,
  transformInjectorResolutionPathsIntoTree,
} from './injector-tree-fns';
import {
  Direction,
  ResponsiveSplitConfig,
  ResponsiveSplitDirective,
} from '../../shared/responsive-split/responsive-split.directive';

const ENV_HIERARCHY_VER_SIZE = 35;
const EL_HIERARCHY_VER_SIZE = 65;
const HIERARCHY_HOR_SIZE = 50;

@Component({
  selector: 'ng-injector-tree',
  imports: [
    SplitComponent,
    SplitAreaDirective,
    InjectorProvidersComponent,
    TreeVisualizerHostComponent,
    MatIcon,
    MatTooltip,
    MatCheckbox,
    ResponsiveSplitDirective,
  ],
  templateUrl: `./injector-tree.component.html`,
  styleUrls: ['./injector-tree.component.scss'],
  host: {
    '[hidden]': 'hidden()',
  },
})
export class InjectorTreeComponent {
  private readonly environmentTree = viewChild<TreeVisualizerHostComponent>('environmentTree');
  private readonly elementTree = viewChild<TreeVisualizerHostComponent>('elementTree');

  private readonly messageBus = inject<MessageBus<Events>>(MessageBus);
  private readonly zone = inject(NgZone);

  protected readonly selectedNode = signal<InjectorTreeD3Node | null>(null);

  protected readonly providers = input.required<SerializedProviderRecord[]>();
  protected readonly componentExplorerView = input.required<ComponentExplorerView | null>();
  protected readonly hidden = input<boolean>(false);

  protected readonly diDebugAPIsAvailable = computed<boolean>(() => {
    const view = this.componentExplorerView();
    return !!(view && view.forest.length && view.forest[0].resolutionPath);
  });

  private firstRender = true;
  private rawDirectiveForest: DevToolsNode[] = [];
  private injectorTreeGraph!: InjectorTreeVisualizer;
  private elementInjectorTreeGraph!: InjectorTreeVisualizer;
  private elementToEnvironmentPath: Map<string, SerializedInjector[]> = new Map();

  private hideInjectorsWithNoProviders = false;
  private hideFrameworkInjectors = false;

  protected readonly responsiveSplitConfig: ResponsiveSplitConfig = {
    defaultDirection: 'vertical',
    aspectRatioBreakpoint: 1.5,
    breakpointDirection: 'horizontal',
  };

  protected readonly envHierarchySize = signal<number>(0);
  protected readonly elHierarchySize = signal<number>(0);

  constructor() {
    afterRenderEffect({
      write: () => {
        const view = this.componentExplorerView();
        if (!this.diDebugAPIsAvailable() || !view || untracked(this.hidden)) {
          return;
        }

        if (!this.isInitialized) {
          this.init();
        }

        this.rawDirectiveForest = view.forest;
        untracked(() => this.updateInjectorTreeVisualization(view.forest));
      },
    });
  }

  private get isInitialized(): boolean {
    return !!(this.injectorTreeGraph && this.elementInjectorTreeGraph);
  }

  private init() {
    this.messageBus.on('highlightComponent', (id: number) => {
      const injectorNode = this.getNodeByComponentId(this.elementInjectorTreeGraph, id);
      if (injectorNode === null) {
        return;
      }

      this.selectInjectorByNode(injectorNode);
    });

    this.setUpEnvironmentInjectorVisualizer();
    this.setUpElementInjectorVisualizer();
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

  snapToNode(node?: InjectorTreeD3Node) {
    if (!node) {
      return;
    }

    // wait for CD to run before snapping to root so that svg container can change size.
    setTimeout(() => {
      const {type} = node.data.injector;

      if (type === 'element') {
        this.elementInjectorTreeGraph.snapToNode(node);
      } else if (type === 'environment') {
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
    const environmentTree = this.environmentTree();
    if (!environmentTree) {
      return;
    }

    const svg = environmentTree.container().nativeElement;
    const g = environmentTree.group().nativeElement;

    this.injectorTreeGraph?.cleanup?.();
    this.injectorTreeGraph = new TreeVisualizer(svg, g, {
      d3NodeModifier: d3InjectorTreeNodeModifier,
      d3LinkModifier: d3InjectorTreeLinkModifier,
    });
  }

  setUpElementInjectorVisualizer(): void {
    const elementTree = this.elementTree();
    if (!elementTree) {
      return;
    }

    const svg = elementTree.container().nativeElement;
    const g = elementTree.group().nativeElement;

    this.elementInjectorTreeGraph?.cleanup?.();
    this.elementInjectorTreeGraph = new TreeVisualizer(svg, g, {
      nodeSeparation: () => 1,
      d3NodeModifier: d3InjectorTreeNodeModifier,
      d3LinkModifier: d3InjectorTreeLinkModifier,
    });
  }

  highlightPathFromSelectedInjector(): void {
    const environmentTree = this.environmentTree();
    const elementTree = this.elementTree();
    if (!environmentTree || !elementTree) {
      return;
    }

    const envGroup = environmentTree.group();
    const elementGroup = elementTree.group();

    this.unhighlightAllEdges(elementGroup);
    this.unhighlightAllNodes(elementGroup);
    this.unhighlightAllEdges(envGroup);
    this.unhighlightAllNodes(envGroup);

    this.checkIfSelectedNodeStillExists();

    if (this.selectedNode() === null) {
      return;
    }

    if (this.selectedNode()!.data.injector.type === 'element') {
      const idsToRoot = getInjectorIdsToRootFromNode(this.selectedNode()!);
      idsToRoot.forEach((id) => this.highlightNodeById(elementGroup, id));
      const edgeIds = generateEdgeIdsFromNodeIds(idsToRoot);
      edgeIds.forEach((edgeId) => this.highlightEdgeById(elementGroup, edgeId));

      const environmentPath =
        this.elementToEnvironmentPath.get(this.selectedNode()!.data.injector.id) ?? [];
      environmentPath.forEach((injector) => this.highlightNodeById(envGroup, injector.id));
      const environmentEdgeIds = generateEdgeIdsFromNodeIds(
        environmentPath.map((injector) => injector.id),
      );
      environmentEdgeIds.forEach((edgeId) => this.highlightEdgeById(envGroup, edgeId));
    } else {
      const idsToRoot = getInjectorIdsToRootFromNode(this.selectedNode()!);
      idsToRoot.forEach((id) => this.highlightNodeById(envGroup, id));
      const edgeIds = generateEdgeIdsFromNodeIds(idsToRoot);
      edgeIds.forEach((edgeId) => this.highlightEdgeById(envGroup, edgeId));
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

    const selectedNode = this.selectedNode();
    if (selectedNode) {
      this.snapToNode(selectedNode);
      this.getProviders(selectedNode);
    }
  }

  getProviders(node: InjectorTreeD3Node) {
    const injector = node.data.injector;
    this.messageBus.emit('getInjectorProviders', [
      {
        id: injector.id,
        type: injector.type,
        name: injector.name,
      },
    ]);
  }

  onResponsiveSplitDirChange(direction: Direction) {
    if (direction === 'vertical') {
      this.envHierarchySize.set(ENV_HIERARCHY_VER_SIZE);
      this.elHierarchySize.set(EL_HIERARCHY_VER_SIZE);
    } else {
      this.envHierarchySize.set(HIERARCHY_HOR_SIZE);
      this.elHierarchySize.set(HIERARCHY_HOR_SIZE);
    }
  }
}
