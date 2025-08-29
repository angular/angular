/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  ComponentExplorerView,
  DevToolsNode,
  Events,
  MessageBus,
  SerializedInjector,
  SerializedProviderRecord,
} from '../../../../../protocol';

import {TreeD3Node, TreeVisualizerConfig} from '../../shared/tree-visualizer/tree-visualizer';
import {TreeVisualizerComponent} from '../../shared/tree-visualizer/tree-visualizer.component';
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
  InjectorTreeNode,
  InjectorTreeVisualizer,
  splitInjectorPathsIntoElementAndEnvironmentPaths,
  transformInjectorResolutionPathsIntoTree,
} from './injector-tree-fns';
import {
  ResponsiveSplitConfig,
  ResponsiveSplitDirective,
} from '../../shared/split/responsive-split.directive';
import {SplitAreaDirective} from '../../shared/split/splitArea.directive';
import {SplitComponent} from '../../shared/split/split.component';
import {Direction} from '../../shared/split/interface';
import {DocsRefButtonComponent} from '../../shared/docs-ref-button/docs-ref-button.component';

const ENV_HIERARCHY_VER_SIZE = 35;
const EL_HIERARCHY_VER_SIZE = 65;
const HIERARCHY_HOR_SIZE = 50;

const INIT_SNAP_ZOOM_SCALE = 0.7;
const SNAP_ZOOM_SCALE = 0.8;

@Component({
  selector: 'ng-injector-tree',
  imports: [
    SplitComponent,
    SplitAreaDirective,
    InjectorProvidersComponent,
    TreeVisualizerComponent,
    ResponsiveSplitDirective,
    DocsRefButtonComponent,
  ],
  templateUrl: `./injector-tree.component.html`,
  styleUrls: ['./injector-tree.component.scss'],
  host: {
    '[hidden]': 'hidden()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InjectorTreeComponent {
  private readonly elementTree = viewChild<InjectorTreeVisualizer>('elementTree');
  private readonly environmentTree = viewChild<InjectorTreeVisualizer>('environmentTree');

  private readonly messageBus = inject<MessageBus<Events>>(MessageBus);

  protected readonly selectedNode = signal<InjectorTreeD3Node | null>(null);

  protected readonly providers = input.required<SerializedProviderRecord[]>();
  protected readonly componentExplorerView = input.required<ComponentExplorerView | null>();
  protected readonly hidden = input<boolean>(false);

  protected readonly diDebugAPIsAvailable = computed<boolean>(() => {
    const view = this.componentExplorerView();
    return !!(view && view.forest.length && view.forest[0].resolutionPath);
  });

  private rawDirectiveForest: DevToolsNode[] = [];
  private elementToEnvironmentPath: Map<string, SerializedInjector[]> = new Map();

  private hideInjectorsWithNoProviders = false;
  private hideFrameworkInjectors = false;

  protected readonly elementInjectorTree = signal<InjectorTreeNode | null>(null);
  protected readonly environmentInjectorTree = signal<InjectorTreeNode | null>(null);

  protected readonly responsiveSplitConfig: ResponsiveSplitConfig = {
    defaultDirection: 'vertical',
    aspectRatioBreakpoint: 1.5,
    breakpointDirection: 'horizontal',
  };

  protected readonly envHierarchySize = signal<number>(0);
  protected readonly elHierarchySize = signal<number>(0);

  environmentTreeConfig: Partial<TreeVisualizerConfig<InjectorTreeNode>> = {
    d3NodeModifier: d3InjectorTreeNodeModifier,
    d3LinkModifier: d3InjectorTreeLinkModifier,
  };

  elementTreeConfig: Partial<TreeVisualizerConfig<InjectorTreeNode>> = {
    nodeSeparation: () => 1,
    d3NodeModifier: d3InjectorTreeNodeModifier,
    d3LinkModifier: d3InjectorTreeLinkModifier,
  };

  constructor() {
    afterRenderEffect({
      write: () => {
        const view = this.componentExplorerView();
        if (!this.diDebugAPIsAvailable() || !view || untracked(this.hidden)) {
          return;
        }

        this.init();
        this.rawDirectiveForest = view.forest;
        untracked(() => this.updateInjectorTreeVisualization(view.forest));
      },
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

  onTreeRender(tree: InjectorTreeVisualizer, {initial}: {initial: boolean}) {
    if (initial) {
      this.snapToRoot(tree);
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

  onResponsiveSplitDirChange(direction: Direction) {
    if (direction === 'vertical') {
      this.envHierarchySize.set(ENV_HIERARCHY_VER_SIZE);
      this.elHierarchySize.set(EL_HIERARCHY_VER_SIZE);
    } else {
      this.envHierarchySize.set(HIERARCHY_HOR_SIZE);
      this.elHierarchySize.set(HIERARCHY_HOR_SIZE);
    }
  }

  private init() {
    this.messageBus.on('highlightComponent', (id: number) => {
      const elementTree = this.elementTree();
      if (!elementTree) {
        return;
      }
      const injectorNode = this.getNodeByComponentId(elementTree, id);
      if (injectorNode === null) {
        return;
      }

      this.selectInjectorByNode(injectorNode);
    });
  }

  private refreshVisualizer(): void {
    this.updateInjectorTreeVisualization(this.rawDirectiveForest);

    if (this.selectedNode()?.data.injector.type === 'environment') {
      this.snapToRoot(this.environmentTree());
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
  private updateInjectorTreeVisualization(forestWithInjectorPaths: DevToolsNode[]): void {
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

    this.elementInjectorTree.set(elementInjectorTree);
    this.environmentInjectorTree.set(environmentInjectorTree);

    this.highlightPathFromSelectedInjector();
  }

  private snapToRoot(tree: InjectorTreeVisualizer | undefined) {
    if (!tree) {
      return;
    }

    // wait for CD to run before snapping to root so that svg container can change size.
    setTimeout(() => {
      if (tree.root().children) {
        // Selecting the child of the root since the root is hidden.
        tree.snapToNode(tree.root().children[0], INIT_SNAP_ZOOM_SCALE);
      }
    });
  }

  private snapToNode(node?: InjectorTreeD3Node) {
    if (!node) {
      return;
    }

    // wait for CD to run before snapping to root so that svg container can change size.
    setTimeout(() => {
      const {type} = node.data.injector;

      if (type === 'element') {
        this.elementTree()?.snapToNode(node.data, SNAP_ZOOM_SCALE);
      } else if (type === 'environment') {
        this.environmentTree()?.snapToNode(node.data, SNAP_ZOOM_SCALE);
      }
    });
  }

  private reselectSelectedNode(): void {
    const selectedNode = this.selectedNode();
    if (!selectedNode) {
      return;
    }

    const injector = selectedNode.data.injector;
    let newNode: TreeD3Node<InjectorTreeNode> | null = null;

    if (injector.type === 'element') {
      newNode = this.elementTree()?.getNodeById(injector.id) ?? null;
    } else if (injector.type === 'environment') {
      newNode = this.environmentTree()?.getNodeById(injector.id) ?? null;
    }

    if (newNode) {
      this.selectedNode.set(newNode);
    } else {
      this.selectedNode.set(null);
      this.snapToRoot(this.environmentTree());
      this.snapToRoot(this.elementTree());
    }
  }

  private getNodeByComponentId(
    tree: InjectorTreeVisualizer,
    id: number,
  ): InjectorTreeD3Node | null {
    const element = tree.svg.querySelector(`.node[data-component-id="${id}"]`);
    if (element === null) {
      return null;
    }

    const injectorId = element.getAttribute('data-id');
    if (injectorId === null) {
      return null;
    }

    return tree.getNodeById(injectorId) ?? null;
  }

  private highlightPathFromSelectedInjector(): void {
    const environmentTree = this.environmentTree();
    const elementTree = this.elementTree();
    if (!environmentTree || !elementTree) {
      return;
    }

    this.unhighlightAllEdges(elementTree);
    this.unhighlightAllNodes(elementTree);
    this.unhighlightAllEdges(environmentTree);
    this.unhighlightAllNodes(environmentTree);

    this.reselectSelectedNode();

    if (this.selectedNode() === null) {
      return;
    }

    if (this.selectedNode()!.data.injector.type === 'element') {
      const idsToRoot = getInjectorIdsToRootFromNode(this.selectedNode()!);
      idsToRoot.forEach((id) => this.highlightNodeById(elementTree, id));
      const edgeIds = generateEdgeIdsFromNodeIds(idsToRoot);
      edgeIds.forEach((edgeId) => this.highlightEdgeById(elementTree, edgeId));

      const environmentPath =
        this.elementToEnvironmentPath.get(this.selectedNode()!.data.injector.id) ?? [];
      environmentPath.forEach((injector) => this.highlightNodeById(environmentTree, injector.id));
      const environmentEdgeIds = generateEdgeIdsFromNodeIds(
        environmentPath.map((injector) => injector.id),
      );
      environmentEdgeIds.forEach((edgeId) => this.highlightEdgeById(environmentTree, edgeId));
    } else {
      const idsToRoot = getInjectorIdsToRootFromNode(this.selectedNode()!);
      idsToRoot.forEach((id) => this.highlightNodeById(environmentTree, id));
      const edgeIds = generateEdgeIdsFromNodeIds(idsToRoot);
      edgeIds.forEach((edgeId) => this.highlightEdgeById(environmentTree, edgeId));
    }
  }

  private highlightNodeById(tree: InjectorTreeVisualizer, id: string): void {
    const node = tree.svg.querySelector(`.node[data-id="${id}"]`);
    if (!node) {
      return;
    }
    if (this.selectedNode()!.data.injector.id === id) {
      node.classList.add('selected');
    }
    node.classList.add('highlighted');
  }

  private highlightEdgeById(tree: InjectorTreeVisualizer, id: string): void {
    const edge = tree.svg.querySelector(`.link[data-id="${id}"]`);
    if (!edge) {
      return;
    }

    edge.classList.add('highlighted');
  }

  private unhighlightAllEdges(tree: InjectorTreeVisualizer): void {
    const edges = tree.svg.querySelectorAll('.link');
    for (const edge of edges) {
      edge.classList.remove('highlighted');
    }
  }

  private unhighlightAllNodes(tree: InjectorTreeVisualizer): void {
    const nodes = tree.svg.querySelectorAll('.node');
    for (const node of nodes) {
      node.classList.remove('selected');
      node.classList.remove('highlighted');
    }
  }

  private getProviders(node: InjectorTreeD3Node) {
    const injector = node.data.injector;
    this.messageBus.emit('getInjectorProviders', [
      {
        id: injector.id,
        type: injector.type,
        name: injector.name,
      },
    ]);
  }
}
