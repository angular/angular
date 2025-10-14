/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {TreeVisualizer} from './tree-visualizer';
let instanceIdx = 0;
let TreeVisualizerComponent = class TreeVisualizerComponent {
  constructor() {
    this.container = viewChild.required('container');
    this.group = viewChild.required('group');
    this.root = input.required();
    this.config = input();
    this.a11yTitle = input.required();
    this.a11yTitleId = `tree-vis-host-${++instanceIdx}`;
    this.ready = output();
    this.render = output();
    this.nodeClick = output();
    this.nodeMouseout = output();
    this.nodeMouseover = output();
    this.panning = signal(false);
    this.initialRender = true;
    afterNextRender(() => {
      this.visualizer?.cleanup();
      this.visualizer = new TreeVisualizer(
        this.container().nativeElement,
        this.group().nativeElement,
        this.config(),
      );
      this.ready.emit();
    });
    effect(() => {
      this.renderGraph(this.root());
    });
    inject(DestroyRef).onDestroy(() => {
      this.visualizer?.dispose();
    });
  }
  get svg() {
    return this.container().nativeElement;
  }
  snapToRoot(scale) {
    this.visualizer?.snapToRoot(scale);
  }
  snapToNode(node, scale) {
    this.visualizer?.snapToNode(node, scale);
  }
  getNodeById(id) {
    return this.visualizer?.getInternalNodeById(id);
  }
  renderGraph(root) {
    if (!this.visualizer) {
      return;
    }
    this.visualizer.render(root);
    this.visualizer.onNodeClick((_, node) => this.nodeClick.emit(node));
    this.visualizer.onNodeMouseout((_, node) => this.nodeMouseout.emit(node));
    this.visualizer.onNodeMouseover((_, node) => this.nodeMouseover.emit(node));
    this.render.emit({initial: this.initialRender});
    if (this.initialRender) {
      this.initialRender = false;
    }
  }
};
TreeVisualizerComponent = __decorate(
  [
    Component({
      selector: 'ng-tree-visualizer',
      template: `
    <svg
      #container
      [class.panning]="panning()"
      (pointerdown)="panning.set(true)"
      (pointerup)="panning.set(false)"
      [attr.aria-labelledby]="a11yTitleId"
    >
      <title [id]="a11yTitleId">{{ this.a11yTitle() }}</title>
      <g #group></g>
    </svg>
  `,
      styleUrl: 'tree-visualizer.component.scss',
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  TreeVisualizerComponent,
);
export {TreeVisualizerComponent};
//# sourceMappingURL=tree-visualizer.component.js.map
