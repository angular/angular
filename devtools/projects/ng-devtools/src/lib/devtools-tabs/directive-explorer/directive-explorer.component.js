/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {
  Component,
  afterRenderEffect,
  ElementRef,
  inject,
  Input,
  input,
  output,
  signal,
  viewChild,
  ChangeDetectionStrategy,
  computed,
  linkedSignal,
  DestroyRef,
} from '@angular/core';
import {MessageBus, PropertyQueryTypes} from '../../../../../protocol';
import {ApplicationOperations} from '../../application-operations/index';
import {FrameManager} from '../../application-services/frame_manager';
import {BreadcrumbsComponent} from './directive-forest/breadcrumbs/breadcrumbs.component';
import {DirectiveForestComponent} from './directive-forest/directive-forest.component';
import {constructPathOfKeysToPropertyValue} from './property-resolver/directive-property-resolver';
import {ElementPropertyResolver} from './property-resolver/element-property-resolver';
import {PropertyTabComponent} from './property-tab/property-tab.component';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {FormsModule} from '@angular/forms';
import {Platform} from '@angular/cdk/platform';
import {MatSnackBarModule, MatSnackBar} from '@angular/material/snack-bar';
import {SignalsTabComponent} from './signals-view/signals-tab.component';
import {ResponsiveSplitDirective} from '../../shared/split/responsive-split.directive';
import {SplitAreaDirective} from '../../shared/split/splitArea.directive';
import {SplitComponent} from '../../shared/split/split.component';
import {SignalGraphManager} from './signal-graph/signal-graph-manager';
const FOREST_VER_SPLIT_SIZE = 30;
const SIGNAL_GRAPH_VER_SPLIT_SIZE = 70;
const HOR_SPLIT_SIZE = 50;
const sameDirectives = (a, b) => {
  if ((a.component && !b.component) || (!a.component && b.component)) {
    return false;
  }
  if (a.component && b.component && a.component.id !== b.component.id) {
    return false;
  }
  const aDirectives = new Set(a.directives.map((d) => d.id));
  for (const dir of b.directives) {
    if (!aDirectives.has(dir.id)) {
      return false;
    }
  }
  return true;
};
let DirectiveExplorerComponent = class DirectiveExplorerComponent {
  constructor() {
    this.showCommentNodes = input(false);
    this.isHydrationEnabled = false;
    this.toggleInspector = output();
    this.directiveForest = viewChild.required(DirectiveForestComponent);
    this.splitElementRef = viewChild.required(SplitComponent, {read: ElementRef});
    this.directiveForestSplitArea = viewChild.required('directiveForestSplitArea', {
      read: ElementRef,
    });
    this.currentSelectedElement = signal(null);
    this.forest = signal([]);
    this.splitDirection = signal('horizontal');
    this.parents = signal(null);
    this.showHydrationNodeHighlights = signal(false);
    this.signalsOpen = signal(false);
    this._clickedElement = null;
    this._refreshRetryTimeout = null;
    this._appOperations = inject(ApplicationOperations);
    this._messageBus = inject(MessageBus);
    this._propResolver = inject(ElementPropertyResolver);
    this._frameManager = inject(FrameManager);
    this.platform = inject(Platform);
    this.snackBar = inject(MatSnackBar);
    this.signalGraph = inject(SignalGraphManager);
    this.preselectedSignalNodeId = linkedSignal({
      source: this.currentSelectedElement,
      computation: () => null,
    });
    this.responsiveSplitConfig = {
      defaultDirection: 'vertical',
      aspectRatioBreakpoint: 1.5,
      breakpointDirection: 'horizontal',
    };
    this.forestSplitSize = signal(FOREST_VER_SPLIT_SIZE);
    this.signalGraphSplitSize = signal(SIGNAL_GRAPH_VER_SPLIT_SIZE);
    this.currentElementPos = computed(() => this.currentSelectedElement()?.position);
    afterRenderEffect((cleanup) => {
      const splitElement = this.splitElementRef().nativeElement;
      const directiveForestSplitArea = this.directiveForestSplitArea().nativeElement;
      const resizeObserver = new ResizeObserver((entries) => {
        this.refreshHydrationNodeHighlightsIfNeeded();
        const resizedEntry = entries[0];
        if (resizedEntry.target === splitElement) {
          this.splitDirection.set(
            resizedEntry.contentRect.width <= 500 ? 'vertical' : 'horizontal',
          );
        }
      });
      resizeObserver.observe(splitElement);
      resizeObserver.observe(directiveForestSplitArea);
      cleanup(() => {
        resizeObserver.disconnect();
      });
    });
    this.subscribeToBackendEvents();
    this.refresh();
    this.signalGraph.listen(this.currentElementPos);
    inject(DestroyRef).onDestroy(() => {
      this.signalGraph.destroy();
    });
  }
  isNonTopLevelFirefoxFrame() {
    return this.platform.FIREFOX && !this._frameManager.topLevelFrameIsActive();
  }
  handleNodeSelection(node) {
    if (node) {
      // We want to guarantee that we're not reusing any of the previous properties.
      // That's possible if the user has selected an NgForOf and after that
      // they select another NgForOf instance. In this case, we don't want to diff the props
      // we want to render from scratch.
      if (this._clickedElement && !sameDirectives(this._clickedElement, node)) {
        this._propResolver.clearProperties();
      }
      this._clickedElement = node;
      this._messageBus.emit('setSelectedComponent', [node.position]);
      this.refresh();
    } else {
      this._clickedElement = null;
      this.currentSelectedElement.set(null);
    }
  }
  subscribeToBackendEvents() {
    this._messageBus.on('latestComponentExplorerView', (view) => {
      this.forest.set(view.forest);
      this.currentSelectedElement.set(this._clickedElement);
      if (view.properties && this._clickedElement) {
        this._propResolver.setProperties(this._clickedElement, view.properties);
      }
    });
    this._messageBus.on('componentTreeDirty', () => this.refresh());
  }
  refresh() {
    const success = this._messageBus.emit('getLatestComponentExplorerView', [
      this._constructViewQuery(),
    ]);
    this._messageBus.emit('getRoutes');
    // If the event was not throttled, we no longer need to retry.
    if (success) {
      this._refreshRetryTimeout && clearTimeout(this._refreshRetryTimeout);
      this._refreshRetryTimeout = null;
      return;
    }
    // If the event was throttled and we haven't scheduled a retry yet.
    if (!this._refreshRetryTimeout) {
      this._refreshRetryTimeout = setTimeout(() => this.refresh(), 500);
    }
    this.refreshHydrationNodeHighlightsIfNeeded();
  }
  viewSource(directiveName) {
    // find the index of the directive with directiveName in this.currentSelectedElement.directives
    const selectedEl = this.currentSelectedElement();
    if (!selectedEl) return;
    const directiveIndex = selectedEl.directives.findIndex(
      (directive) => directive.name === directiveName,
    );
    const selectedFrame = this._frameManager.selectedFrame();
    if (!this._frameManager.activeFrameHasUniqueUrl()) {
      const error = `The currently inspected frame does not have a unique url on this page. Cannot view source.`;
      this.snackBar.open(error, 'Dismiss', {duration: 5000, horizontalPosition: 'left'});
      this._messageBus.emit('log', [{level: 'warn', message: error}]);
      return;
    }
    if (this.isNonTopLevelFirefoxFrame()) {
      const error = `Viewing source is not supported in Firefox when the inspected frame is not the top-level frame.`;
      this.snackBar.open(error, 'Dismiss', {duration: 5000, horizontalPosition: 'left'});
      this._messageBus.emit('log', [{level: 'warn', message: error}]);
    } else {
      this._appOperations.viewSource(
        selectedEl.position,
        selectedFrame,
        directiveIndex !== -1 ? directiveIndex : undefined,
      );
    }
  }
  handleSelectDomElement(node) {
    const selectedFrame = this._frameManager.selectedFrame();
    if (!this._frameManager.activeFrameHasUniqueUrl()) {
      const error = `The currently inspected frame does not have a unique url on this page. Cannot select DOM element.`;
      this.snackBar.open(error, 'Dismiss', {duration: 5000, horizontalPosition: 'left'});
      this._messageBus.emit('log', [{level: 'warn', message: error}]);
      return;
    }
    if (this.isNonTopLevelFirefoxFrame()) {
      const error = `Inspecting a component's DOM element is not supported in Firefox when the inspected frame is not the top-level frame.`;
      this.snackBar.open(error, 'Dismiss', {duration: 5000, horizontalPosition: 'left'});
      this._messageBus.emit('log', [{level: 'warn', message: error}]);
    } else {
      this._appOperations.selectDomElement(node.position, selectedFrame);
    }
  }
  highlight(node) {
    if (!node.original.component) {
      return;
    }
    this._messageBus.emit('createHighlightOverlay', [node.position]);
  }
  unhighlight() {
    this._messageBus.emit('removeHighlightOverlay');
  }
  _constructViewQuery() {
    if (!this._clickedElement) {
      return;
    }
    return {
      selectedElement: this._clickedElement.position,
      propertyQuery: this._getPropertyQuery(),
    };
  }
  _getPropertyQuery() {
    // Here we handle the case when a given element has already been selected.
    // We check if we're dealing with the same instance (i.e., if we have the same
    // set of directives and component on it), if we do, we want to get the same
    // set of properties which are already expanded.
    if (
      !this._clickedElement ||
      !this.currentSelectedElement() ||
      !sameDirectives(this._clickedElement, this.currentSelectedElement())
    ) {
      return {
        type: PropertyQueryTypes.All,
      };
    }
    return {
      type: PropertyQueryTypes.Specified,
      properties: this._propResolver.getExpandedProperties() || {},
    };
  }
  highlightComponent(position) {
    this._messageBus.emit('createHighlightOverlay', [position]);
  }
  removeComponentHighlight() {
    this._messageBus.emit('removeHighlightOverlay');
  }
  handleSelect(node) {
    this.directiveForest()?.selectAndEnsureVisible(node);
  }
  handleSetParents(parents) {
    this.parents.set(parents);
  }
  inspect({node, directivePosition}) {
    const objectPath = constructPathOfKeysToPropertyValue(node.prop);
    const selectedFrame = this._frameManager.selectedFrame();
    if (!this._frameManager.activeFrameHasUniqueUrl()) {
      const error = `The currently inspected frame does not have a unique url on this page. Cannot inspect object.`;
      this.snackBar.open(error, 'Dismiss', {duration: 5000, horizontalPosition: 'left'});
      this._messageBus.emit('log', [{level: 'warn', message: error}]);
      return;
    }
    if (this.isNonTopLevelFirefoxFrame()) {
      const error = `Inspecting object is not supported in Firefox when the inspected frame is not the top-level frame.`;
      this.snackBar.open(error, 'Dismiss', {duration: 5000, horizontalPosition: 'left'});
      this._messageBus.emit('log', [{level: 'warn', message: error}]);
    } else {
      this._appOperations.inspect(directivePosition, objectPath, selectedFrame);
    }
  }
  hightlightHydrationNodes() {
    this._messageBus.emit('createHydrationOverlay');
  }
  removeHydrationNodesHightlights() {
    this._messageBus.emit('removeHydrationOverlay');
  }
  refreshHydrationNodeHighlightsIfNeeded() {
    if (this.showHydrationNodeHighlights()) {
      this.removeHydrationNodesHightlights();
      this.hightlightHydrationNodes();
    }
  }
  showSignalGraph(node) {
    if (node) {
      this.preselectedSignalNodeId.set(node.id);
    }
    this.signalsOpen.set(true);
  }
  onResponsiveSplitDirChange(direction) {
    if (direction === 'vertical') {
      this.forestSplitSize.set(FOREST_VER_SPLIT_SIZE);
      this.signalGraphSplitSize.set(SIGNAL_GRAPH_VER_SPLIT_SIZE);
    } else {
      this.forestSplitSize.set(HOR_SPLIT_SIZE);
      this.signalGraphSplitSize.set(HOR_SPLIT_SIZE);
    }
  }
};
__decorate([Input()], DirectiveExplorerComponent.prototype, 'isHydrationEnabled', void 0);
DirectiveExplorerComponent = __decorate(
  [
    Component({
      selector: 'ng-directive-explorer',
      templateUrl: './directive-explorer.component.html',
      styleUrls: ['./directive-explorer.component.scss'],
      providers: [
        {
          provide: ElementPropertyResolver,
          useClass: ElementPropertyResolver,
        },
        SignalGraphManager,
      ],
      imports: [
        SplitComponent,
        SplitAreaDirective,
        DirectiveForestComponent,
        BreadcrumbsComponent,
        PropertyTabComponent,
        MatSlideToggle,
        FormsModule,
        MatSnackBarModule,
        SignalsTabComponent,
        ResponsiveSplitDirective,
      ],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  DirectiveExplorerComponent,
);
export {DirectiveExplorerComponent};
//# sourceMappingURL=directive-explorer.component.js.map
