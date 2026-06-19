/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementPosition} from '../../../../protocol';

import {
  findComponentAndHost,
  findNodeInForest,
  getDirectiveName,
} from '../component-tree/component-tree';
import {getDirectiveForestManager} from '../directive-forest/manager';
import {highlightElement} from '../highlighter';
import {Highlight, inspectElementHighlightTemplate} from '../highlighter/highlights';
import {ComponentTreeNode} from '../interfaces';

interface Type<T> extends Function {
  new (...args: any[]): T;
}

export interface ComponentInspectorOptions {
  onComponentEnter: (id: number) => void;
  onComponentSelect: (id: number) => void;
  onComponentLeave: () => void;
}

export class ComponentInspector {
  private _selectedComponent!: {component: Type<unknown>; host: HTMLElement | null};
  private readonly _onComponentEnter;
  private readonly _onComponentSelect;
  private readonly _onComponentLeave;
  private currentHighlight: Highlight | null = null;

  constructor(
    componentOptions: ComponentInspectorOptions = {
      onComponentEnter: () => {},
      onComponentLeave: () => {},
      onComponentSelect: () => {},
    },
  ) {
    this.bindMethods();
    this._onComponentEnter = componentOptions.onComponentEnter;
    this._onComponentSelect = componentOptions.onComponentSelect;
    this._onComponentLeave = componentOptions.onComponentLeave;
  }

  startInspecting(): void {
    window.addEventListener('mouseover', this.elementMouseOver, true);
    window.addEventListener('click', this.elementClick, true);
    window.addEventListener('mouseout', this.cancelEvent, true);
  }

  stopInspecting(): void {
    window.removeEventListener('mouseover', this.elementMouseOver, true);
    window.removeEventListener('click', this.elementClick, true);
    window.removeEventListener('mouseout', this.cancelEvent, true);
    this.unhighlight();
  }

  elementClick(e: MouseEvent): void {
    e.stopImmediatePropagation();
    e.preventDefault();

    if (this._selectedComponent.component && this._selectedComponent.host) {
      this._onComponentSelect(
        getDirectiveForestManager().getDirectiveId(this._selectedComponent.component)!,
      );
    }
  }

  elementMouseOver(e: MouseEvent): void {
    this.cancelEvent(e);

    const el = e.target as HTMLElement;
    if (el) {
      this._selectedComponent = findComponentAndHost(el);
    }

    this.unhighlight();
    if (this._selectedComponent.component && this._selectedComponent.host) {
      this.highlightElement(this._selectedComponent.host);
      this._onComponentEnter(
        getDirectiveForestManager().getDirectiveId(this._selectedComponent.component)!,
      );
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
    this.elementClick = this.elementClick.bind(this);
    this.cancelEvent = this.cancelEvent.bind(this);
  }

  highlightByPosition(position: ElementPosition): void {
    const forest: ComponentTreeNode[] = getDirectiveForestManager().getDirectiveForest();
    const elementToHighlight: HTMLElement | null = findNodeInForest(position, forest);
    if (elementToHighlight) {
      this.highlightElement(elementToHighlight);
    }
  }

  unhighlight() {
    this.currentHighlight?.destroy();
    this.currentHighlight = null;
  }

  private highlightElement(element: HTMLElement) {
    this.unhighlight();
    const cmp = findComponentAndHost(element).component;
    this.currentHighlight = highlightElement(element, inspectElementHighlightTemplate, {
      'component-name': [getDirectiveName(cmp)],
    });
  }
}
