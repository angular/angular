/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  Renderer2,
  viewChild,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {getDirectivesArrayString, getFullNodeNameString} from '../directive-forest-utils';
const PADDING_LEFT_STEP = 15; // px
let TreeNodeComponent = class TreeNodeComponent {
  constructor() {
    this.renderer = inject(Renderer2);
    this.doc = inject(DOCUMENT);
    this.nodeName = viewChild.required('nodeName');
    this.node = input.required();
    this.selectedNode = input.required();
    this.highlightedId = input.required();
    this.treeControl = input.required();
    this.textMatches = input([]);
    this.selectNode = output();
    this.selectDomElement = output();
    this.highlightNode = output();
    this.removeHighlight = output();
    this.paddingLeft = computed(() => (this.node().level + 1) * PADDING_LEFT_STEP + 'px');
    this.isElement = computed(() => {
      const cmp = this.node().original.component;
      return cmp && cmp.isElement;
    });
    this.directivesArrayString = computed(() => getDirectivesArrayString(this.node()));
    this.nodeNameString = computed(() => getFullNodeNameString(this.node()));
    this.matchedText = null;
    this.PADDING_LEFT_STEP = PADDING_LEFT_STEP;
    afterRenderEffect({write: () => this.handleMatchedText()});
  }
  get isSelected() {
    const selectedNode = this.selectedNode();
    return !!selectedNode && selectedNode.id === this.node().id;
  }
  get isHighlighted() {
    return !!this.highlightedId() && this.highlightedId() === this.node().original.component?.id;
  }
  handleMatchedText() {
    if (this.matchedText) {
      this.renderer.removeChild(this.nodeName().nativeElement, this.matchedText);
      this.matchedText = null;
    }
    const textMatches = this.textMatches();
    if (textMatches.length) {
      this.buildMatchedTextElement(textMatches);
    }
  }
  buildMatchedTextElement(textMatches) {
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
  appendText(parent, text, markedText = false) {
    let textNode;
    if (!markedText) {
      textNode = this.doc.createTextNode(text);
    } else {
      textNode = this.renderer.createElement('mark');
      textNode.textContent = text;
    }
    this.renderer.appendChild(parent, textNode);
  }
};
TreeNodeComponent = __decorate(
  [
    Component({
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
    }),
  ],
  TreeNodeComponent,
);
export {TreeNodeComponent};
//# sourceMappingURL=tree-node.component.js.map
