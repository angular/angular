/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementPosition} from '../../../../protocol';

import {
  findDirectiveAndHost,
  findNodeInForest,
  getDirectiveName,
} from '../component-tree/component-tree';
import {getDirectiveForestManager} from '../directive-forest/manager';
import {Highlight, inspectElementHighlightTemplate} from '../highlighter/highlights';
import {highlightElement} from '../highlighter';
import {ComponentTreeNode} from '../interfaces';

export interface ComponentInspectorOptions {
  onComponentEnter: (id: number) => void;
  onComponentSelect: (id: number) => void;
  onComponentLeave: () => void;
}

export class ComponentInspector {
  private _selectedDirective!: {directive: unknown; host: Element | null};
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

    if (this._selectedDirective.directive && this._selectedDirective.host) {
      this._onComponentSelect(
        getDirectiveForestManager().getDirectiveId(this._selectedDirective.directive)!,
      );
    }
  }

  elementMouseOver(e: MouseEvent): void {
    this.cancelEvent(e);

    const el = e.target;
    if (el instanceof Node) {
      this._selectedDirective = findDirectiveAndHost(el);
    }

    this.unhighlight();
    if (this._selectedDirective.directive && this._selectedDirective.host) {
      this.highlightElement(this._selectedDirective.host);
      this._onComponentEnter(
        getDirectiveForestManager().getDirectiveId(this._selectedDirective.directive)!,
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
    const elementToHighlight = findNodeInForest(position, forest);
    if (elementToHighlight) {
      this.highlightElement(elementToHighlight);
    }
  }

  unhighlight() {
    this.currentHighlight?.destroy();
    this.currentHighlight = null;
  }

  private highlightElement(element: Element) {
    this.unhighlight();
    const cmp = findDirectiveAndHost(element).directive;
    this.currentHighlight = highlightElement(element, inspectElementHighlightTemplate, {
      'component-name': [getDirectiveName(cmp)],
    });
  }
}
