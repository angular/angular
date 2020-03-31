import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import {
  MessageBus,
  Events,
  DevToolsNode,
  ComponentExplorerViewQuery,
  ComponentExplorerView,
  ElementPosition,
  PropertyQuery,
  PropertyQueryTypes,
} from 'protocol';
import { IndexedNode } from './directive-forest/index-forest';
import { ApplicationOperations } from '../../application-operations';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { ElementPropertyResolver } from './property-resolver/element-property-resolver';
import { FlatNode } from './directive-forest/component-data-source';
import { DirectiveForestComponent } from './directive-forest/directive-forest.component';

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
})
export class DirectiveExplorerComponent implements OnInit {
  currentSelectedElement: IndexedNode | null = null;
  forest: DevToolsNode[];
  highlightIDinTreeFromElement: ElementPosition | null = null;
  splitDirection = 'horizontal';

  private _changeSize = new Subject<Event>();
  private _clickedElement: IndexedNode | null = null;
  parents: FlatNode[] | null = null;

  @ViewChild(DirectiveForestComponent) directiveForest: DirectiveForestComponent;

  constructor(
    private _appOperations: ApplicationOperations,
    private _messageBus: MessageBus<Events>,
    private _propResolver: ElementPropertyResolver
  ) {
    this._changeSize
      .asObservable()
      .pipe(throttleTime(100))
      .subscribe((event) => this.handleResize(event));
  }

  ngOnInit(): void {
    this.subscribeToBackendEvents();
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
      this._clickedElement = this.currentSelectedElement = null;
    }
  }

  subscribeToBackendEvents(): void {
    this._messageBus.on('latestComponentExplorerView', (view: ComponentExplorerView) => {
      this.forest = view.forest;
      this.currentSelectedElement = this._clickedElement;
      if (view.properties && this.currentSelectedElement) {
        this._propResolver.setProperties(this.currentSelectedElement, view.properties);
      }
    });

    this._messageBus.on('highlightComponentInTreeFromElement', (position: ElementPosition) => {
      this.highlightIDinTreeFromElement = position;
    });
    this._messageBus.on('removeHighlightFromComponentTree', () => {
      this.highlightIDinTreeFromElement = null;
    });

    this._messageBus.on('componentTreeDirty', () => this.refresh());
    this.refresh();
  }

  refresh(): void {
    const success = this._messageBus.emit('getLatestComponentExplorerView', [this._constructViewQuery()]);
    if (!success) {
      setTimeout(() => this.refresh(), 500);
    }
  }

  viewSource(): void {
    if (!this.currentSelectedElement) {
      return;
    }
    this._appOperations.viewSource(this.currentSelectedElement.position);
  }

  handleSelectDomElement(node: IndexedNode): void {
    this._appOperations.selectDomElement(node.position);
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
      !this.currentSelectedElement ||
      !sameDirectives(this._clickedElement, this.currentSelectedElement)
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

  handleHighlightFromComponent(position: ElementPosition): void {
    this._messageBus.emit('highlightElementFromComponentTree', [position]);
  }

  handleUnhighlightFromComponent(_: ElementPosition | null): void {
    this._messageBus.emit('removeHighlightFromElement');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this._changeSize.next(event);
  }

  handleResize(event: Event): void {
    if ((event.target as any).innerWidth <= 500) {
      this.splitDirection = 'vertical';
    } else {
      this.splitDirection = 'horizontal';
    }
  }

  handleSelect(node: FlatNode): void {
    this.directiveForest.handleSelect(node);
  }

  handleSetParents(parents: FlatNode[] | null): void {
    this.parents = parents;
  }
}
