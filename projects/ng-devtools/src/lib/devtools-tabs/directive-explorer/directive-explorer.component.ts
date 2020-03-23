import { Component, HostListener, OnInit } from '@angular/core';
import {
  MessageBus,
  Events,
  DevToolsNode,
  ComponentExplorerViewQuery,
  ComponentExplorerView,
  ElementPosition,
  Descriptor,
  PropertyQuery,
  PropertyQueryTypes,
} from 'protocol';
import { IndexedNode } from './directive-forest/index-forest';
import { ApplicationOperations } from '../../application-operations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { ElementPropertyResolver } from './property-resolver/element-property-resolver';

const sameDirectives = (a: IndexedNode, b: IndexedNode) => {
  if ((a.component && !b.component) || (!a.component && b.component)) {
    return false;
  }
  if (a.component && b.component && a.component.id !== b.component.id) {
    return false;
  }
  const aDirectives = new Set(a.directives.map(d => d.id));
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
  styleUrls: ['./directive-explorer.component.css'],
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
  private _requestingNestedProperties = false;
  private _refreshScheduled = false;

  constructor(
    private _appOperations: ApplicationOperations,
    private _snackBar: MatSnackBar,
    private _messageBus: MessageBus<Events>,
    private _propResolver: ElementPropertyResolver
  ) {
    this._changeSize
      .asObservable()
      .pipe(throttleTime(100))
      .subscribe(event => this.handleResize(event));
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
        this._propResolver.setProperties(
          this.currentSelectedElement,
          view.properties,
          () => {
            this._requestingNestedProperties = true;
          },
          () => {
            this._requestingNestedProperties = false;
            if (this._refreshScheduled) {
              this.refresh();
            }
          }
        );
      }
    });

    this._messageBus.on('highlightComponentInTreeFromElement', (position: ElementPosition) => {
      this.highlightIDinTreeFromElement = position;
    });
    this._messageBus.on('removeHighlightFromComponentTree', () => {
      this.highlightIDinTreeFromElement = null;
    });

    // Only one refresh per 0.5 seconds.
    let buffering = false;
    this._messageBus.on('componentTreeDirty', () => {
      if (buffering) {
        return;
      }
      buffering = true;
      setTimeout(() => {
        buffering = false;
        this.refresh();
      }, 500);
    });
    this.refresh();
  }

  refresh(): void {
    if (this._requestingNestedProperties) {
      this._refreshScheduled = true;
      return;
    }
    this._messageBus.emit('getLatestComponentExplorerView', [this._constructViewQuery()]);
    this._refreshScheduled = false;
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

  copyPropData(directive: string): void {
    const handler = (e: ClipboardEvent) => {
      let data = {};
      const controller = this._propResolver.getDirectiveController(directive);
      if (controller) {
        data = controller.directiveProperties;
      }
      if (!e.clipboardData) {
        return;
      }
      e.clipboardData.setData('text/plain', JSON.stringify(cleanPropDataForCopying(data)));
      e.preventDefault();
      document.removeEventListener('copy', handler);
      this._snackBar.open('Copied to clipboard!', '', {
        duration: 1000,
      });
    };
    document.addEventListener('copy', handler);
    document.execCommand('copy');
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
}

const cleanPropDataForCopying = (propData: { [name: string]: Descriptor }, cleanedPropData = {}): object => {
  Object.keys(propData).forEach(key => {
    if (typeof propData[key].value === 'object') {
      cleanedPropData[key] = {};
      cleanPropDataForCopying(propData[key].value, cleanedPropData[key]);
    } else {
      cleanedPropData[key] = propData[key].value || propData[key].preview;
    }
  });
  return cleanedPropData;
};
