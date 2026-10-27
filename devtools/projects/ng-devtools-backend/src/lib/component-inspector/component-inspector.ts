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
} from '../directive-forest/component-tree/component-tree';
import {getDirectiveForestManager} from '../directive-forest/manager';
import {Highlight, inspectElementHighlightTemplate} from '../shared/highlighter/highlights';
import {highlightElement} from '../shared/highlighter';
import {ComponentTreeNode} from '../shared/interfaces';

export interface ComponentInspectorOptions {
  onComponentEnter: (id: number) => void;
  onComponentSelect: (id: number) => void;
  onComponentLeave: () => void;
}

export class ComponentInspector {
  private selectedDirective!: {directive: unknown; host: Element | null};
  private readonly onComponentEnter;
  private readonly onComponentSelect;
  private readonly onComponentLeave;
  private currentHighlight: Highlight | null = null;

  constructor(
    componentOptions: ComponentInspectorOptions = {
      onComponentEnter: () => {},
      onComponentLeave: () => {},
      onComponentSelect: () => {},
    },
  ) {
    this.bindMethods();
    this.onComponentEnter = componentOptions.onComponentEnter;
    this.onComponentSelect = componentOptions.onComponentSelect;
    this.onComponentLeave = componentOptions.onComponentLeave;
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

    if (this.selectedDirective.directive && this.selectedDirective.host) {
      this.onComponentSelect(
        getDirectiveForestManager().getDirectiveId(this.selectedDirective.directive)!,
      );
    }
  }

  elementMouseOver(e: MouseEvent): void {
    this.cancelEvent(e);

    const el = e.target;
    if (el instanceof Node) {
      this.selectedDirective = findDirectiveAndHost(el);
    }

    this.unhighlight();
    if (this.selectedDirective.directive && this.selectedDirective.host) {
      this.highlightElement(this.selectedDirective.host);
      this.onComponentEnter(
        getDirectiveForestManager().getDirectiveId(this.selectedDirective.directive)!,
      );
    }
  }

  cancelEvent(e: MouseEvent): void {
    e.stopImmediatePropagation();
    e.preventDefault();
    this.onComponentLeave();
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
