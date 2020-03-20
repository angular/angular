import { unHighlight, highlight, findComponentAndHost } from '../highlighter';
import { Type } from '@angular/core';
import {
  buildDirectiveForest,
  ComponentTreeNode,
  findNodeInForest,
  getIndexForNativeElementInForest,
} from '../component-tree';
import { ElementPosition } from 'protocol';
import { IndexedNode, indexForest } from '../observer/identity-tracker';

export interface ComponentInspectorOptions {
  onComponentEnter: (position: ElementPosition) => void;
  onComponentLeave: () => void;
}

export class ComponentInspector {
  private _selectedComponent: { component: Type<unknown>; host: HTMLElement | null };
  private readonly _onComponentEnter;
  private readonly _onComponentLeave;

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
    if (this._selectedComponent.component && this._selectedComponent.host) {
      highlight(this._selectedComponent.host);
      const forest: IndexedNode[] = indexForest(buildDirectiveForest((window as any).ng));
      const elementPosition: ElementPosition | null = getIndexForNativeElementInForest(
        this._selectedComponent.host,
        forest
      );
      this._onComponentEnter(elementPosition);
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

  highlightByPosition(position: ElementPosition): void {
    const forest: ComponentTreeNode[] = buildDirectiveForest((window as any).ng);
    const elementToHighlight: HTMLElement | null = findNodeInForest(position, forest);
    if (elementToHighlight) {
      highlight(elementToHighlight);
    }
  }
}
