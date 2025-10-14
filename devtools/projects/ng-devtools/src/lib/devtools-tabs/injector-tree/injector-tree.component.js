/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
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
import {MessageBus} from '../../../../../protocol';
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
  splitInjectorPathsIntoElementAndEnvironmentPaths,
  transformInjectorResolutionPathsIntoTree,
} from './injector-tree-fns';
import {ResponsiveSplitDirective} from '../../shared/split/responsive-split.directive';
import {SplitAreaDirective} from '../../shared/split/splitArea.directive';
import {SplitComponent} from '../../shared/split/split.component';
import {DocsRefButtonComponent} from '../../shared/docs-ref-button/docs-ref-button.component';
const ENV_HIERARCHY_VER_SIZE = 35;
const EL_HIERARCHY_VER_SIZE = 65;
const HIERARCHY_HOR_SIZE = 50;
const INIT_SNAP_ZOOM_SCALE = 0.7;
const SNAP_ZOOM_SCALE = 0.8;
let InjectorTreeComponent = class InjectorTreeComponent {
  constructor() {
    this.elementTree = viewChild('elementTree');
    this.environmentTree = viewChild('environmentTree');
    this.messageBus = inject(MessageBus);
    this.selectedNode = signal(null);
    this.injectorProvidersEnabled = signal(false);
    this.injectorProvidersVisible = computed(
      () => this.injectorProvidersEnabled() && this.selectedNode() && this.providers().length > 0,
    );
    this.providers = input.required();
    this.componentExplorerView = input.required();
    this.hidden = input(false);
    this.diDebugAPIsAvailable = computed(() => {
      const view = this.componentExplorerView();
      return !!(view && view.forest.length && view.forest[0].resolutionPath);
    });
    this.rawDirectiveForest = [];
    this.elementToEnvironmentPath = new Map();
    this.hideInjectorsWithNoProviders = false;
    this.hideFrameworkInjectors = false;
    this.elementInjectorTree = signal(null);
    this.environmentInjectorTree = signal(null);
    this.responsiveSplitConfig = {
      defaultDirection: 'vertical',
      aspectRatioBreakpoint: 1.5,
      breakpointDirection: 'horizontal',
    };
    this.envHierarchySize = signal(0);
    this.elHierarchySize = signal(0);
    this.environmentTreeConfig = {
      d3NodeModifier: d3InjectorTreeNodeModifier,
      d3LinkModifier: d3InjectorTreeLinkModifier,
      arrowDirection: 'child-to-parent',
    };
    this.elementTreeConfig = {
      nodeSeparation: () => 1,
      d3NodeModifier: d3InjectorTreeNodeModifier,
      d3LinkModifier: d3InjectorTreeLinkModifier,
      arrowDirection: 'child-to-parent',
    };
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
  toggleHideInjectorsWithNoProviders() {
    this.hideInjectorsWithNoProviders = !this.hideInjectorsWithNoProviders;
    this.refreshVisualizer();
  }
  toggleHideAngularInjectors() {
    this.hideFrameworkInjectors = !this.hideFrameworkInjectors;
    this.refreshVisualizer();
  }
  onTreeRender(tree, {initial}) {
    if (initial) {
      this.snapToRoot(tree);
    }
  }
  selectInjectorByNode(node) {
    this.selectedNode.set(node);
    this.injectorProvidersEnabled.set(true);
    this.highlightPathFromSelectedInjector();
    const selectedNode = this.selectedNode();
    if (selectedNode) {
      this.snapToNode(selectedNode);
      this.getProviders(selectedNode);
    }
  }
  onResponsiveSplitDirChange(direction) {
    if (direction === 'vertical') {
      this.envHierarchySize.set(ENV_HIERARCHY_VER_SIZE);
      this.elHierarchySize.set(EL_HIERARCHY_VER_SIZE);
    } else {
      this.envHierarchySize.set(HIERARCHY_HOR_SIZE);
      this.elHierarchySize.set(HIERARCHY_HOR_SIZE);
    }
  }
  init() {
    this.messageBus.on('highlightComponent', (id) => {
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
  refreshVisualizer() {
    this.updateInjectorTreeVisualization(this.rawDirectiveForest);
    if (this.selectedNode()?.data.injector.type === 'environment') {
      this.snapToRoot(this.environmentTree());
    }
    if (this.selectedNode()) {
      this.selectInjectorByNode(this.selectedNode());
    }
  }
  /**
   *
   * Converts the array of resolution paths for every node in the
   * directive forest into a tree structure that can be rendered by the
   * injector tree visualizer.
   *
   */
  updateInjectorTreeVisualization(forestWithInjectorPaths) {
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
  snapToRoot(tree) {
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
  snapToNode(node) {
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
  reselectSelectedNode() {
    const selectedNode = this.selectedNode();
    if (!selectedNode) {
      return;
    }
    const injector = selectedNode.data.injector;
    let newNode = null;
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
  getNodeByComponentId(tree, id) {
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
  highlightPathFromSelectedInjector() {
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
    if (this.selectedNode().data.injector.type === 'element') {
      const idsToRoot = getInjectorIdsToRootFromNode(this.selectedNode());
      idsToRoot.forEach((id) => this.highlightNodeById(elementTree, id));
      const edgeIds = generateEdgeIdsFromNodeIds(idsToRoot);
      edgeIds.forEach((edgeId) => this.highlightEdgeById(elementTree, edgeId));
      const environmentPath =
        this.elementToEnvironmentPath.get(this.selectedNode().data.injector.id) ?? [];
      environmentPath.forEach((injector) => this.highlightNodeById(environmentTree, injector.id));
      const environmentEdgeIds = generateEdgeIdsFromNodeIds(
        environmentPath.map((injector) => injector.id),
      );
      environmentEdgeIds.forEach((edgeId) => this.highlightEdgeById(environmentTree, edgeId));
    } else {
      const idsToRoot = getInjectorIdsToRootFromNode(this.selectedNode());
      idsToRoot.forEach((id) => this.highlightNodeById(environmentTree, id));
      const edgeIds = generateEdgeIdsFromNodeIds(idsToRoot);
      edgeIds.forEach((edgeId) => this.highlightEdgeById(environmentTree, edgeId));
    }
  }
  highlightNodeById(tree, id) {
    const node = tree.svg.querySelector(`.node[data-id="${id}"]`);
    if (!node) {
      return;
    }
    if (this.selectedNode().data.injector.id === id) {
      node.classList.add('selected');
    }
    node.classList.add('highlighted');
  }
  highlightEdgeById(tree, id) {
    const edge = tree.svg.querySelector(`.link[data-id="${id}"]`);
    if (!edge) {
      return;
    }
    edge.classList.add('highlighted');
  }
  unhighlightAllEdges(tree) {
    const edges = tree.svg.querySelectorAll('.link');
    for (const edge of edges) {
      edge.classList.remove('highlighted');
    }
  }
  unhighlightAllNodes(tree) {
    const nodes = tree.svg.querySelectorAll('.node');
    for (const node of nodes) {
      node.classList.remove('selected');
      node.classList.remove('highlighted');
    }
  }
  getProviders(node) {
    const injector = node.data.injector;
    this.messageBus.emit('getInjectorProviders', [
      {
        id: injector.id,
        type: injector.type,
        name: injector.name,
      },
    ]);
  }
};
InjectorTreeComponent = __decorate(
  [
    Component({
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
    }),
  ],
  InjectorTreeComponent,
);
export {InjectorTreeComponent};
//# sourceMappingURL=injector-tree.component.js.map
