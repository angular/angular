import { unHighlight, highlight, findComponentAndHost } from './highlighter';
import { Type } from '@angular/core';
import {
  getDirectiveForest,
  ComponentTreeNode,
  findNodeInForest,
  getIndexForNativeElementInForest,
} from './component-tree';
import { ElementID } from 'protocol';
import { indexForest, IndexedNode } from './recording/observer';

export interface ComponentInspectorOptions {
  onComponentEnter: (id: ElementID) => void;
  onComponentLeave: () => void;
}

export class ComponentInspector {
  private _selectedComponent: { component: Type<unknown>; host: HTMLElement };
  private _onComponentEnter;
  private _onComponentLeave;

  constructor(
    componentOptions: ComponentInspectorOptions = { onComponentEnter: () => {}, onComponentLeave: () => {} }
  ) {
    this.bindMethods();
    this._onComponentEnter = componentOptions.onComponentEnter;
    this._onComponentLeave = componentOptions.onComponentLeave;
  }

  startInspecting(): void {
    window.addEventListener('mouseover', this.elementMouseOver, true);
    window.addEventListener('mouseout', this.cancelEvent, true);
    window.addEventListener('mouseenter', this.cancelEvent, true);
    window.addEventListener('mouseleave', this.cancelEvent, true);
    window.addEventListener('mousedown', this.cancelEvent, true);
    window.addEventListener('mouseup', this.cancelEvent, true);
  }

  /**
   * Removes event listeners
   */
  stopInspecting(): void {
    window.removeEventListener('mouseover', this.elementMouseOver, true);
    window.removeEventListener('mouseout', this.cancelEvent, true);
    window.removeEventListener('mouseenter', this.cancelEvent, true);
    window.removeEventListener('mouseleave', this.cancelEvent, true);
    window.removeEventListener('mousedown', this.cancelEvent, true);
    window.removeEventListener('mouseup', this.cancelEvent, true);

    unHighlight();
  }

  elementMouseOver(e: MouseEvent): void {
    this.cancelEvent(e);

    const el = e.target as HTMLElement;
    if (el) {
      this._selectedComponent = findComponentAndHost(el);
    }

    unHighlight();
    if (this._selectedComponent.component) {
      highlight(this._selectedComponent.host);
      const forest: IndexedNode[] = indexForest(getDirectiveForest());
      const elementId: ElementID = getIndexForNativeElementInForest(this._selectedComponent.host, forest);
      this._onComponentEnter(elementId);
    }
  }

  cancelEvent(e: MouseEvent): void {
    e.stopImmediatePropagation();
    e.preventDefault();
    this._onComponentLeave();
  }

  bindMethods(): void {
    this.startInspecting = this.startInspecting.bind(this);
    this.stopInspecting = this.stopInspecting.bind(this);
    this.elementMouseOver = this.elementMouseOver.bind(this);
    this.cancelEvent = this.cancelEvent.bind(this);
  }

  highlightById(id: ElementID): void {
    const forest: ComponentTreeNode[] = getDirectiveForest();
    const elementToHighlight: HTMLElement = findNodeInForest(id, forest);
    highlight(elementToHighlight);
  }
}
