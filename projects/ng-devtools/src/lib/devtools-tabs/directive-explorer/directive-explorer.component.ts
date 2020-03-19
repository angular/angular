import { Component, HostListener, OnInit } from '@angular/core';
import {
  MessageBus,
  Events,
  DevToolsNode,
  DirectivesProperties,
  ComponentExplorerViewQuery,
  ComponentExplorerView,
  ElementPosition,
  Descriptor,
} from 'protocol';
import { IndexedNode } from './directive-forest/index-forest';
import { ApplicationOperations } from '../../application-operations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { ElementPropertyResolver } from './property-resolver/element-property-resolver';

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
  directivesData: DirectivesProperties | null = null;
  currentSelectedElement: IndexedNode | null = null;
  forest: DevToolsNode[];
  highlightIDinTreeFromElement: ElementPosition | null = null;

  splitDirection = 'horizontal';

  private _changeSize = new Subject<Event>();
  private _clickedElement: IndexedNode | null = null;

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

  unselectNode(): void {
    console.log('unselectNode');
    this.currentSelectedElement = this._clickedElement = null;
  }

  handleNodeSelection(node: IndexedNode | null): void {
    if (node) {
      this._clickedElement = node;
      this._messageBus.emit('getElementDirectivesProperties', [node.position]);
      this._messageBus.emit('setSelectedComponent', [node.position]);
    } else {
      this._clickedElement = this.currentSelectedElement = null;
    }
  }

  subscribeToBackendEvents(): void {
    this._messageBus.on('elementDirectivesProperties', (data: DirectivesProperties) => {
      this.currentSelectedElement = this._clickedElement;
      if (data) {
        this._propResolver.setProperties(this.currentSelectedElement, data);
      }
    });

    this._messageBus.on('latestComponentExplorerView', (view: ComponentExplorerView) => {
      this.forest = view.forest;
      this.currentSelectedElement = this._clickedElement;
      if (view.properties) {
        this._propResolver.setProperties(this.currentSelectedElement, view.properties);
      }
    });

    this._messageBus.on('highlightComponentInTreeFromElement', (position: ElementPosition) => {
      this.highlightIDinTreeFromElement = position;
    });
    this._messageBus.on('removeHighlightFromComponentTree', () => {
      this.highlightIDinTreeFromElement = null;
    });

    // Only one refresh per 50ms.
    let buffering = false;
    this._messageBus.on('componentTreeDirty', () => {
      if (buffering) {
        return;
      }
      buffering = true;
      setTimeout(() => {
        buffering = false;
        this.refresh();
      }, 50);
    });
    this.refresh();
  }

  refresh(): void {
    this._messageBus.emit('getLatestComponentExplorerView', [this._constructViewQuery()]);
  }

  viewSource(): void {
    this._appOperations.viewSource(this.currentSelectedElement.position);
  }

  handleSelectDomElement(node: IndexedNode): void {
    this._appOperations.selectDomElement(node.position);
  }

  private _constructViewQuery(): ComponentExplorerViewQuery {
    if (!this.currentSelectedElement) {
      return { selectedElement: null, expandedProperties: null };
    }
    return {
      selectedElement: this.currentSelectedElement.position,
      expandedProperties: this._propResolver.getExpandedProperties(),
    };
  }

  copyPropData(directive: string): void {
    const handler = (e: ClipboardEvent) => {
      let data = {};
      const controller = this._propResolver.getDirectiveController(directive);
      if (controller) {
        data = controller.getDirectiveProperties();
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
