/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  Renderer2,
  viewChild,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';

import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {FlatTreeControl} from '@angular/cdk/tree';

import {FlatNode} from '../component-data-source';
import {getDirectivesArrayString, getFullNodeNameString} from '../directive-forest-utils';

const PADDING_LEFT_STEP = 15; // px

export type NodeTextMatch = {
  startIdx: number;
  endIdx: number;
};

@Component({
  selector: 'ng-tree-node',
  templateUrl: './tree-node.component.html',
  styleUrls: ['./tree-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatTooltip],
  host: {
    '[style.padding-left]': 'paddingLeft()',
    '[class.selected]': 'isSelected',
    '[class.highlighted]': 'isHighlighted',
    '[class.new-node]': 'node().newItem',
    '(click)': 'selectNode.emit(this.node())',
    '(dblclick)': 'selectDomElement.emit(this.node())',
    '(mouseenter)': 'highlightNode.emit(this.node())',
    '(mouseleave)': 'removeHighlight.emit()',
  },
})
export class TreeNodeComponent {
  private readonly renderer = inject(Renderer2);
  private readonly doc = inject(DOCUMENT);

  protected readonly nodeName = viewChild.required<ElementRef>('nodeName');

  protected readonly node = input.required<FlatNode>();
  protected readonly selectedNode = input.required<FlatNode | null>();
  protected readonly highlightedId = input.required<number | null>();
  protected readonly treeControl = input.required<FlatTreeControl<FlatNode>>();
  protected readonly textMatches = input<NodeTextMatch[]>([]);

  protected readonly selectNode = output<FlatNode>();
  protected readonly selectDomElement = output<FlatNode>();
  protected readonly highlightNode = output<FlatNode>();
  protected readonly removeHighlight = output<void>();

  protected readonly paddingLeft = computed(
    () => (this.node().level + 1) * PADDING_LEFT_STEP + 'px',
  );
  protected readonly isElement = computed(() => {
    const cmp = this.node().original.component;
    return cmp && cmp.isElement;
  });
  protected readonly directivesArrayString = computed(() => getDirectivesArrayString(this.node()));
  private readonly nodeNameString = computed(() => getFullNodeNameString(this.node()));

  private matchedText: HTMLElement | null = null;

  protected readonly PADDING_LEFT_STEP = PADDING_LEFT_STEP;

  constructor() {
    afterRenderEffect({write: () => this.handleMatchedText()});
  }

  protected get isSelected(): boolean {
    const selectedNode = this.selectedNode();
    return !!selectedNode && selectedNode.id === this.node().id;
  }

  protected get isHighlighted(): boolean {
    return !!this.highlightedId() && this.highlightedId() === this.node().original.component?.id;
  }

  private handleMatchedText() {
    if (this.matchedText) {
      this.renderer.removeChild(this.nodeName().nativeElement, this.matchedText);
      this.matchedText = null;
    }

    const textMatches = this.textMatches();
    if (textMatches.length) {
      this.buildMatchedTextElement(textMatches);
    }
  }

  private buildMatchedTextElement(textMatches: NodeTextMatch[]) {
    const matchedText = this.renderer.createElement('span');
    this.renderer.addClass(matchedText, 'matched-text');

    const name = this.nodeNameString();
    let lastMatchEndIdx = 0;

    for (const {startIdx, endIdx} of textMatches) {
      if (lastMatchEndIdx < startIdx) {
        // Filler/non-marked text
        this.appendText(matchedText, name.slice(lastMatchEndIdx, startIdx), false);
      }
      this.appendText(matchedText, name.slice(startIdx, endIdx), true);
      lastMatchEndIdx = endIdx;
    }

    this.matchedText = matchedText;
    this.renderer.appendChild(this.nodeName().nativeElement, this.matchedText);
  }

  private appendText(parent: HTMLElement, text: string, markedText = false) {
    let textNode: Element | Text;
    if (!markedText) {
      textNode = this.doc.createTextNode(text);
    } else {
      textNode = this.renderer.createElement('mark');
      textNode.textContent = text;
    }
    this.renderer.appendChild(parent, textNode);
  }
}
