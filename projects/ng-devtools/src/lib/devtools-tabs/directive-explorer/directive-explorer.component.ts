import { Component, Input, OnInit, ViewChildren, QueryList } from '@angular/core';
import {
  MessageBus,
  Events,
  Node,
  DirectivesProperties,
  DirectiveID,
  ComponentExplorerViewQuery,
  ComponentExplorerView,
  ComponentExplorerViewProperties,
  ElementID,
  Properties,
} from 'protocol';
import { IndexedNode } from './directive-forest/index-forest';
import { PropertyViewComponent } from './property-view/property-view.component';
import { ApplicationOperations } from '../../application-operations';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'ng-directive-explorer',
  templateUrl: './directive-explorer.component.html',
  styleUrls: ['./directive-explorer.component.css'],
})
export class DirectiveExplorerComponent implements OnInit {
  @Input() messageBus: MessageBus<Events>;

  @ViewChildren(PropertyViewComponent) propertyViews: QueryList<PropertyViewComponent>;

  // The original data we pass to the property viewer.
  // Later, the property viewer may request more nested properties
  // from the backend.
  directivesData: DirectivesProperties | null = null;
  currentSelectedElement: IndexedNode;
  forest: Node[];
  highlightIDinTreeFromElement: ElementID | null = null;

  constructor(private _appOperations: ApplicationOperations, private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.subscribeToBackendEvents();

    // Only one refresh per 50ms.
    let buffering = false;
    this.messageBus.on('componentTreeDirty', () => {
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

  handleNodeSelection(node: IndexedNode): void {
    this.currentSelectedElement = node;
    this.messageBus.emit('getElementDirectivesProperties', [node.id]);
    this.messageBus.emit('setSelectedComponent', [node.id]);
  }

  subscribeToBackendEvents(): void {
    this.messageBus.on('elementDirectivesProperties', (data: DirectivesProperties) => {
      this.directivesData = data;
    });
    this.messageBus.on('latestComponentExplorerView', (view: ComponentExplorerView) => {
      this.forest = view.forest;
      this.directivesData = view.properties;
    });
    this.messageBus.on('highlightComponentInTreeFromElement', (id: ElementID) => {
      this.highlightIDinTreeFromElement = id;
    });
    this.messageBus.on('removeHighlightFromComponentTree', () => {
      this.highlightIDinTreeFromElement = null;
    });
  }

  refresh(): void {
    this.messageBus.emit('getLatestComponentExplorerView', [this._constructViewQuery()]);
  }

  getEntityID(name: string): DirectiveID {
    const idx: DirectiveID = {
      element: this.currentSelectedElement.id,
    };
    const cmp = this.currentSelectedElement.component;
    if (cmp && cmp.name === name) {
      return idx;
    }
    idx.directive = this.currentSelectedElement.directives.findIndex(d => d.name === name);
    return idx;
  }

  nameTracking(_: number, item: { key: string }): string {
    return item.key;
  }

  viewSource(): void {
    this._appOperations.viewSource(this.currentSelectedElement.id);
  }

  handleSelectDomElement(node: IndexedNode): void {
    this._appOperations.selectDomElement(node.id);
  }

  private _constructViewQuery(): ComponentExplorerViewQuery {
    if (!this.currentSelectedElement) {
      return { selectedElement: null, expandedProperties: null };
    }
    return {
      selectedElement: this.currentSelectedElement.id,
      // We get the latest query for the properties.
      // The directive may have extended the properties
      // with nested ones which were dynamically requested
      // during the lifecycle of the app.
      expandedProperties: this._latestDirectiveData(),
    };
  }

  private _latestDirectiveData(): ComponentExplorerViewProperties {
    const result = {};
    this.propertyViews.toArray().forEach(view => {
      result[view.name] = view.getExpandedProperties();
    });
    return result;
  }

  copyPropData(propData: Properties): void {
    const handler = (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', JSON.stringify(cleanPropDataForCopying(propData)));
      e.preventDefault();
      document.removeEventListener('copy', handler);
      this._snackBar.open('Copied to clipboard!', '', {
        duration: 1000,
      });
    };
    document.addEventListener('copy', handler);
    document.execCommand('copy');
  }

  handleHighlightFromComponent(id: ElementID) {
    this.messageBus.emit('highlightElementFromComponentTree', [id]);
  }

  handleUnhighlightFromComponent(id: ElementID | null) {
    this.messageBus.emit('removeHighlightFromElement');
  }
}

const cleanPropDataForCopying = (propData: Properties, cleanedPropData = {}): object => {
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
