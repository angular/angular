/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {TreeD3Node, TreeNode, TreeVisualizer, TreeVisualizerConfig} from './tree-visualizer';

let instanceIdx = 0;

@Component({
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
})
export class TreeVisualizerComponent<T extends TreeNode = TreeNode> {
  protected readonly container = viewChild.required<ElementRef>('container');
  protected readonly group = viewChild.required<ElementRef>('group');

  readonly root = input.required<T>();
  protected readonly config = input<Partial<TreeVisualizerConfig<T>>>();
  protected readonly a11yTitle = input.required<string>();
  protected readonly a11yTitleId = `tree-vis-host-${++instanceIdx}`;

  protected readonly ready = output<void>();
  protected readonly render = output<{initial: boolean}>();
  protected readonly nodeClick = output<TreeD3Node<T>>();
  protected readonly nodeMouseout = output<TreeD3Node<T>>();
  protected readonly nodeMouseover = output<TreeD3Node<T>>();

  panning = signal<boolean>(false);

  private initialRender: boolean = true;
  private visualizer?: TreeVisualizer<T>;

  constructor() {
    afterNextRender(() => {
      this.visualizer?.cleanup();
      this.visualizer = new TreeVisualizer<T>(
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

  get svg(): HTMLElement {
    return this.container().nativeElement;
  }

  snapToRoot(scale?: number) {
    this.visualizer?.snapToRoot(scale);
  }

  snapToNode(node: T, scale?: number) {
    this.visualizer?.snapToNode(node, scale);
  }

  getNodeById(id: string) {
    return this.visualizer?.getInternalNodeById(id);
  }

  private renderGraph(root: T): void {
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
}
