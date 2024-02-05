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
  Input,
  input,
  OnDestroy,
  output,
  signal,
  ViewChild,
  viewChild,
} from '@angular/core';
import {
  ComponentExplorerView,
  ComponentExplorerViewQuery,
  DevToolsNode,
  DirectivePosition,
  ElementPosition,
  Events,
  MessageBus,
  PropertyQuery,
  PropertyQueryTypes,
} from 'protocol';

import {SplitComponent} from '../../../lib/vendor/angular-split/public_api';
import {ApplicationOperations} from '../../application-operations/index';
import {FrameManager} from '../../frame_manager';

import {BreadcrumbsComponent} from './directive-forest/breadcrumbs/breadcrumbs.component';
import {FlatNode} from './directive-forest/component-data-source';
import {DirectiveForestComponent} from './directive-forest/directive-forest.component';
import {IndexedNode} from './directive-forest/index-forest';
import {constructPathOfKeysToPropertyValue} from './property-resolver/directive-property-resolver';
import {
  ElementPropertyResolver,
  FlatNode as PropertyFlatNode,
} from './property-resolver/element-property-resolver';
import {PropertyTabComponent} from './property-tab/property-tab.component';
import {SplitAreaDirective} from '../../vendor/angular-split/lib/component/splitArea.directive';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {FormsModule} from '@angular/forms';

const sameDirectives = (a: IndexedNode, b: IndexedNode) => {
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

@Component({
  selector: 'ng-directive-explorer',
  templateUrl: './directive-explorer.component.html',
  styleUrls: ['./directive-explorer.component.scss'],
  providers: [
    {
      provide: ElementPropertyResolver,
      useClass: ElementPropertyResolver,
    },
  ],
  standalone: true,
  imports: [
    SplitComponent,
    SplitAreaDirective,
    DirectiveForestComponent,
    BreadcrumbsComponent,
    PropertyTabComponent,
    MatSlideToggle,
    FormsModule,
  ],
})
export class DirectiveExplorerComponent implements OnDestroy {
  readonly showCommentNodes = input(false);
  @Input() isHydrationEnabled = false;
  readonly toggleInspector = output<void>();

  readonly directiveForest = viewChild(DirectiveForestComponent);
  @ViewChild(SplitComponent, {static: true, read: ElementRef}) splitElementRef!: ElementRef;
  @ViewChild('directiveForestSplitArea', {static: true, read: ElementRef})
  directiveForestSplitArea!: ElementRef;

  readonly currentSelectedElement = signal<IndexedNode | null>(null);
  readonly forest = signal<DevToolsNode[]>([]);
  readonly splitDirection = signal<'horizontal' | 'vertical'>('horizontal');
  readonly parents = signal<FlatNode[] | null>(null);
  readonly showHydrationNodeHighlights = signal(false);

  private _resizeObserver!: ResizeObserver;

  private _clickedElement: IndexedNode | null = null;
  private _refreshRetryTimeout: null | ReturnType<typeof setTimeout> = null;

  private readonly _appOperations = inject(ApplicationOperations);
  private readonly _messageBus = inject<MessageBus<Events>>(MessageBus);
  private readonly _propResolver = inject(ElementPropertyResolver);
  private readonly _frameManager = inject(FrameManager);

  constructor() {
    afterNextRender(() => {
      this._resizeObserver = new ResizeObserver((entries) => {
        this.refreshHydrationNodeHighlightsIfNeeded();

        const resizedEntry = entries[0];
        if (resizedEntry.target === this.splitElementRef.nativeElement) {
          this.splitDirection.set(
            resizedEntry.contentRect.width <= 500 ? 'vertical' : 'horizontal',
          );
        }
      });

      this.subscribeToBackendEvents();
      this.refresh();
      this._resizeObserver.observe(this.splitElementRef.nativeElement);
      this._resizeObserver.observe(this.directiveForestSplitArea.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this._resizeObserver.unobserve(this.splitElementRef.nativeElement);
    this._resizeObserver.unobserve(this.directiveForestSplitArea.nativeElement);
  }

  handleNodeSelection(node: IndexedNode | null): void {
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

  subscribeToBackendEvents(): void {
    this._messageBus.on('latestComponentExplorerView', (view: ComponentExplorerView) => {
      this.forest.set(view.forest);
      this.currentSelectedElement.set(this._clickedElement);
      if (view.properties && this._clickedElement) {
        this._propResolver.setProperties(this._clickedElement, view.properties);
      }
    });

    this._messageBus.on('componentTreeDirty', () => this.refresh());
  }

  refresh(): void {
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

  viewSource(directiveName: string): void {
    // find the index of the directive with directiveName in this.currentSelectedElement.directives
    const selectedEl = this.currentSelectedElement();
    if (!selectedEl) return;

    if (!this.currentSelectedElement) {
      return;
    }
    console.log(this.currentSelectedElement.position);

    const directiveIndex = this.currentSelectedElement.directives.findIndex(
      (directive) => directive.name === directiveName,
    );

    const selectedFrame = this._frameManager.selectedFrame;
    if (!this._frameManager.frameHasUniqueUrl(selectedFrame)) {
      this._messageBus.emit('log', [
        {
          level: 'warn',
          message: `The currently inspected frame does not have a unique url on this page. Cannot view source.`,
        },
      ]);
      return;
    }

    this._appOperations.viewSource(
      selectedEl.position,
      directiveIndex !== -1 ? directiveIndex : undefined,
      new URL(selectedFrame!.url),
    );
  }

  handleSelectDomElement(node: IndexedNode): void {
    const selectedFrame = this._frameManager.selectedFrame;
    if (!this._frameManager.frameHasUniqueUrl(selectedFrame)) {
      this._messageBus.emit('log', [
        {
          level: 'warn',
          message: `The currently inspected frame does not have a unique url on this page. Cannot select DOM element.`,
        },
      ]);
      return;
    }

    this._appOperations.selectDomElement(node.position, new URL(selectedFrame!.url));
  }

  highlight(node: FlatNode): void {
    if (!node.original.component) {
      return;
    }
    this._messageBus.emit('createHighlightOverlay', [node.position]);
  }

  unhighlight(): void {
    this._messageBus.emit('removeHighlightOverlay');
  }

  private _constructViewQuery(): ComponentExplorerViewQuery | undefined {
    if (!this._clickedElement) {
      return;
    }
    return {
      selectedElement: this._clickedElement.position,
      propertyQuery: this._getPropertyQuery(),
    };
  }

  private _getPropertyQuery(): PropertyQuery {
    // Here we handle the case when a given element has already been selected.
    // We check if we're dealing with the same instance (i.e., if we have the same
    // set of directives and component on it), if we do, we want to get the same
    // set of properties which are already expanded.
    if (
      !this._clickedElement ||
      !this.currentSelectedElement() ||
      !sameDirectives(this._clickedElement, this.currentSelectedElement()!)
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

  highlightComponent(position: ElementPosition): void {
    this._messageBus.emit('createHighlightOverlay', [position]);
  }

  removeComponentHighlight(): void {
    this._messageBus.emit('removeHighlightOverlay');
  }

  handleSelect(node: FlatNode): void {
    this.directiveForest()?.handleSelect(node);
  }

  handleSetParents(parents: FlatNode[] | null): void {
    this.parents.set(parents);
  }

  inspect({
    node,
    directivePosition,
  }: {
    node: PropertyFlatNode;
    directivePosition: DirectivePosition;
  }): void {
    const objectPath = constructPathOfKeysToPropertyValue(node.prop);

    const selectedFrame = this._frameManager.selectedFrame;
    if (!this._frameManager.frameHasUniqueUrl(selectedFrame)) {
      this._messageBus.emit('log', [
        {
          level: 'warn',
          message: `The currently inspected frame does not have a unique url on this page. Cannot inspect object.`,
        },
      ]);
      return;
    }

    this._appOperations.inspect(directivePosition, objectPath, new URL(selectedFrame!.url));
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
}
