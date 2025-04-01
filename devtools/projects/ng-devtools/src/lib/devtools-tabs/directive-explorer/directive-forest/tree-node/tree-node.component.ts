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
  HostBinding,
  HostListener,
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
import {getFullNodeName} from '../directive-forest-utils';

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
})
export class TreeNodeComponent {
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly doc = inject(DOCUMENT);

  readonly nodeName = viewChild.required<ElementRef>('nodeName');

  readonly node = input.required<FlatNode>();
  readonly selectedNode = input.required<FlatNode | null>();
  readonly highlightedId = input.required<number | null>();
  readonly treeControl = input.required<FlatTreeControl<FlatNode>>();
  readonly textMatch = input<NodeTextMatch | undefined>();

  readonly selectNode = output<FlatNode>();
  readonly selectDomElement = output<FlatNode>();
  readonly highlightNode = output<FlatNode>();
  readonly removeHighlight = output<void>();

  readonly isElement = computed(() => {
    const cmp = this.node().original.component;
    return cmp && cmp.isElement;
  });
  private readonly nodeNameString = computed(() => getFullNodeName(this.node()));

  private matchedText: HTMLElement | null = null;

  PADDING_LEFT_STEP = PADDING_LEFT_STEP;

  constructor() {
    afterRenderEffect({
      write: () =>
        this.renderer.setStyle(
          this.elementRef.nativeElement,
          'padding-left',
          (this.node().level + 1) * PADDING_LEFT_STEP + 'px',
        ),
    });

    afterRenderEffect({write: () => this.handleMatchedText()});
  }

  @HostBinding('class.selected')
  get isSelected(): boolean {
    const selectedNode = this.selectedNode();
    return !!selectedNode && selectedNode.id === this.node().id;
  }

  @HostBinding('class.highlighted')
  get isHighlighted(): boolean {
    return !!this.highlightedId() && this.highlightedId() === this.node().original.component?.id;
  }

  @HostBinding('class.new-node')
  get isNew() {
    return this.node().newItem;
  }

  @HostListener('click')
  onNodeClick() {
    this.selectNode.emit(this.node());
  }

  @HostListener('dblclick')
  onNodeDoubleClick() {
    this.selectDomElement.emit(this.node());
  }

  @HostListener('mouseenter')
  onNodeMouseEnter() {
    this.highlightNode.emit(this.node());
  }

  @HostListener('mouseleave')
  onNodeMouseLeave() {
    this.removeHighlight.emit();
  }

  private handleMatchedText() {
    if (this.matchedText) {
      this.renderer.removeChild(this.nodeName().nativeElement, this.matchedText);
      this.matchedText = null;
    }

    const textMatch = this.textMatch();
    if (textMatch) {
      this.buildMatchedTextElement(textMatch.startIdx, textMatch.endIdx);
    }
  }

  private buildMatchedTextElement(startIdx: number, endIdx: number) {
    const name = this.nodeNameString();
    let textBuffer = '';

    const matchedText = this.renderer.createElement('span');
    this.renderer.addClass(matchedText, 'matched-text');

    for (let i = 0; i < name.length; i++) {
      textBuffer += name[i];

      if (i === startIdx - 1 && textBuffer.length) {
        // Add any text that precedes the matched text.
        this.appendText(matchedText, textBuffer);
        textBuffer = '';
      } else if (i === endIdx - 1) {
        // Add the matched text. We don't really need to add the remaining text, if any.
        const match = this.renderer.createElement('mark');
        this.appendText(match, textBuffer);
        this.renderer.appendChild(matchedText, match);
      }
    }

    this.matchedText = matchedText;
    this.renderer.appendChild(this.nodeName().nativeElement, this.matchedText);
  }

  private appendText(parent: HTMLElement, text: string) {
    const textNode = this.doc.createTextNode(text);
    this.renderer.appendChild(parent, textNode);
  }
}
