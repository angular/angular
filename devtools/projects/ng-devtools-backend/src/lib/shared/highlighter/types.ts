/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Add a new type for each new template.
//
// WARNING: The enum numeric value matters. It's used for establishing
// a priority when a single target element has multiple highlights.
// The smaller the number, the higher the priority.
export enum HighlightType {
  ChangeDetection = 0,
  InspectElement = 1,
  HydrationSkipped = 2,
  HydrationMismatched = 3,
  HydrationCompleted = 4,
}

/**
 * Label content function.
 * Can produce a string label or an SVG label (NOTE: The SVGs should be single path with a 24x24 view box).
 */
type LabelContentFn = (...props: any[]) => string | Path2D;
export type HighlightLabelDefinition = Record<string, LabelContentFn>;

export type RgbColor = readonly [red: number, green: number, blue: number];

export type HighlightLabelProps<T extends HighlightLabelDefinition> = Record<
  keyof T,
  Parameters<T[keyof T]>
>;

export interface HighlightLabel<T extends LabelContentFn> {
  /** X axis position. */
  x: 'left' | 'center' | 'right';

  /**
   * Offset placement of the label relative to the highlight container edge.
   * - `outset` – the label is rendered outside the highlight.
   * - `inset` – the label is rendered inside the highlight, if there is enough space to fit.
   * Else, it fall backs to `outset` mode.
   * - `strict-inset` – the label is rendered always inside the highlight.
   * If there isn't enough space, the label won't be displayed.
   */
  offset: 'inset' | 'outset' | 'strict-inset';

  /** Label content template function. */
  content: T;
}

export interface HighlightTemplate<T extends HighlightLabelDefinition = HighlightLabelDefinition> {
  /** Highlight type. */
  type: HighlightType;

  /** Color of the highlight overlay. The labels are also based on it. */
  overlayColor: RgbColor;

  /** Select the style of the overlay – filled or an outline. Default: `fill` */
  style?: 'fill' | 'outline';

  /**
   * Pick whether the labels should be visible/sticky or static.
   */
  labelsType: 'sticky' | 'static';

  /**
   * Represents all labels of the highlight.
   * NOTE: A highlight can have a single label per position
   * (e.g. a single `left`, a single `center` and a single `right`).
   */
  labels: Record<keyof T, HighlightLabel<T[keyof T]>>;

  /** Time to live (in milliseconds). Default: unset */
  ttl?: number;
}

/** Provides a container of all highlight-related references and controls over the highlight. */
export interface Highlight<T extends HighlightLabelDefinition = HighlightLabelDefinition> {
  get targetElement(): WeakRef<Element>;
  get type(): HighlightType;
  get template(): HighlightTemplate<T>;
  get props(): HighlightLabelProps<T>;
  get isDestroyed(): boolean;
  get isDisplayed(): boolean;

  /** Render/append the highlight. */
  display(): void;

  /** Remove the highlight without destroying it. */
  hide(): void;

  /** Update a label of the highlight. */
  updateLabel(labelId: keyof T, ...props: Parameters<T[keyof T]>): void;

  /** Remove and destroy the highlight. */
  destroy(): void;
}
