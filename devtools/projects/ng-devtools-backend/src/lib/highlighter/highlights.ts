/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EventEmitter} from '@angular/core';
import {HydrationStatus} from '../../../../protocol';
import {positionOverlayElement, setLabelElementVisibility} from './dom';

//
// Types & classes
//

type RgbColor = readonly [red: number, green: number, blue: number];

const COLORS = {
  blue: [104, 182, 255],
  red: [255, 0, 64],
  grey: [128, 128, 128],
  green: [91, 201, 92],
} satisfies Record<string, RgbColor>;

type LabelContentFn = (...props: any[]) => Element | string;
export type HighlightLabelDefinition = Record<string, LabelContentFn>;

export type HighlightLabelProps<T extends HighlightLabelDefinition> = Record<
  keyof T,
  Parameters<T[keyof T]>
>;

export interface HighlightLabel<T extends LabelContentFn> {
  /** X axis position. */
  x: 'left' | 'center' | 'right';

  /** Offset placement of the label relative to the highlight container edge. */
  offset: 'inset' | 'outset';

  /** Label content template function. */
  content: T;
}

export interface HighlightTemplate<T extends HighlightLabelDefinition = HighlightLabelDefinition> {
  /** Highlight type. */
  type: HighlightType;

  /** Color of the highlight overlay. The labels are also based on it. */
  overlayColor: RgbColor;

  /**
   * Pick whether the labels should be visible/sticky
   * or static relative to X axis.
   */
  labelsType: 'sticky' | 'static';

  /**
   * Represents all labels of the highlight.
   * NOTE: A highlight can have a single label per position
   * (e.g. a single `left`, a single `center` and a single `right`).
   */
  labels: Record<keyof T, HighlightLabel<T[keyof T]>>;
}

// Add a new type for each new template.
//
// WARNING: The enum numeric value matters. It's used for establishing
// a priority when a single target element has multiple highlights.
// The smaller the number, the higher the priority.
export enum HighlightType {
  InspectElement = 0,
  HydrationSkipped = 1,
  HydrationMismatched = 2,
  HydrationCompleted = 3,
}

/** Provides a container of all highlight-related references and controls over the highlight. */
export class Highlight<T extends HighlightLabelDefinition = HighlightLabelDefinition> {
  private destroyed = false;

  constructor(
    private readonly overlayElement: HTMLElement,
    private readonly labelElements: Record<keyof T, HTMLElement>,
    private readonly template: HighlightTemplate<T>,
    private readonly destroyEvents: EventEmitter<[highlight: Highlight]>,
  ) {
    validateTemplateLabels(template);
  }

  get type() {
    return this.template.type;
  }

  /** Update a label of the highlight. */
  updateLabel(labelId: keyof T, ...props: Parameters<T[keyof T]>) {
    const labelContent = this.template.labels[labelId].content(...props);
    const labelElement = this.labelElements[labelId];

    if (typeof labelContent === 'string') {
      labelElement.textContent = labelContent;
    } else {
      labelElement.replaceChildren(labelContent);
    }
  }

  /** Remove the highlight. */
  destroy() {
    // Since there is a chance that there are references
    // outside of `highlighter.ts`, we store the destroy state.
    // Ideally, we should clean up all references.
    // Getting the warning, means that there might be a problem
    // with the code (i.e. there is chance for a memory leak).
    if (this.destroyed) {
      console.warn('The highlight has already been destroyed. Check references storing.');
      return;
    }
    this.destroyEvents.emit([this]);
    this.overlayElement.remove();
    this.destroyed = true;
  }

  /** Render/append the highlight to the DOM. */
  display() {
    if (!document.body.contains(this.overlayElement)) {
      document.body.appendChild(this.overlayElement);
    }
  }

  /** Remove the highlight from the DOM. */
  hide() {
    if (document.body.contains(this.overlayElement)) {
      document.body.removeChild(this.overlayElement);
    }
  }

  /**
   * Position the highlight by a provided `DOMRect`.
   * If omitted, the current bounding client rect of the target element will be used.
   */
  position(dimensions: DOMRect) {
    positionOverlayElement(dimensions, this.overlayElement);

    for (const [id, label] of Object.entries(this.labelElements)) {
      setLabelElementVisibility(dimensions, label, this.template.labels[id].offset);
    }
  }
}

function validateTemplateLabels(template: HighlightTemplate) {
  const usedXPos = new Set<string>();

  for (const {x} of Object.values(template.labels)) {
    if (usedXPos.has(x)) {
      throw new Error(
        `The template (type: ${template.type}) has multiple labels with '${x}' X position.`,
      );
    }
    usedXPos.add(x);
  }
}

//
// "Inspect element" highlight
//

type InspectElementLabels = {
  'component-name': (name: string) => string;
};

/** Template for "Inspect element" highlight. */
export const inspectElementHighlightTemplate: HighlightTemplate<InspectElementLabels> = {
  type: HighlightType.InspectElement,
  overlayColor: COLORS.blue,
  labelsType: 'sticky',
  labels: {
    ['component-name']: {
      x: 'right',
      offset: 'outset',
      content: (name: string) => `<${name}>`,
    },
  },
};

//
// Hydration highlights
//

// Those are the SVG we inline in case the overlay label is to long for the container component.
const HYDRATION_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><rect fill="none" height="24" width="24"/><path d="M12,2c-5.33,4.55-8,8.48-8,11.8c0,4.98,3.8,8.2,8,8.2s8-3.22,8-8.2C20,10.48,17.33,6.55,12,2z M12,20c-3.35,0-6-2.57-6-6.2 c0-2.34,1.95-5.44,6-9.14c4.05,3.7,6,6.79,6,9.14C18,17.43,15.35,20,12,20z M7.83,14c0.37,0,0.67,0.26,0.74,0.62 c0.41,2.22,2.28,2.98,3.64,2.87c0.43-0.02,0.79,0.32,0.79,0.75c0,0.4-0.32,0.73-0.72,0.75c-2.13,0.13-4.62-1.09-5.19-4.12 C7.01,14.42,7.37,14,7.83,14z"/></svg>`;

const HYDRATION_SKIPPED_SVG = `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><rect fill="none" height="24" width="24"/><path d="M21.19,21.19L2.81,2.81L1.39,4.22l4.2,4.2c-1,1.31-1.6,2.94-1.6,4.7C4,17.48,7.58,21,12,21c1.75,0,3.36-0.56,4.67-1.5 l3.1,3.1L21.19,21.19z M12,19c-3.31,0-6-2.63-6-5.87c0-1.19,0.36-2.32,1.02-3.28L12,14.83V19z M8.38,5.56L12,2l5.65,5.56l0,0 C19.1,8.99,20,10.96,20,13.13c0,1.18-0.27,2.29-0.74,3.3L12,9.17V4.81L9.8,6.97L8.38,5.56z"/></svg>`;

const HYDRATION_ERROR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>`;

type HydrationLabels = {
  'icon': (status: NonNullable<HydrationStatus>['status']) => Element;
};

function createHydrationHighlightTemplate(
  type: HighlightType,
  overlayColor: RgbColor,
): HighlightTemplate<HydrationLabels> {
  return {
    type,
    overlayColor,
    labelsType: 'static',
    labels: {
      icon: {
        x: 'right',
        offset: 'inset',
        content: (type: NonNullable<HydrationStatus>['status']) => {
          let icon: string;
          if (type === 'hydrated') {
            icon = HYDRATION_SVG;
          } else if (type === 'mismatched') {
            icon = HYDRATION_ERROR_SVG;
          } else if (type === 'skipped') {
            icon = HYDRATION_SKIPPED_SVG;
          } else {
            throw new Error(`No icon specified for type ${type}`);
          }

          const svg = new DOMParser().parseFromString(icon, 'image/svg+xml')
            .childNodes[0] as SVGElement;
          svg.style.fill = 'white';
          svg.style.width = '1.5em';
          svg.style.height = '1.5em';
          svg.style.display = 'block';

          return svg;
        },
      },
    },
  };
}

/** Template for completed hydration highlight. */
export const hydrationCompletedHighlightTemplate: HighlightTemplate<HydrationLabels> =
  createHydrationHighlightTemplate(HighlightType.HydrationCompleted, COLORS.green);

/** Template for mismatched hydration highlight. */
export const hydrationMismatchedHighlightTemplate: HighlightTemplate<HydrationLabels> =
  createHydrationHighlightTemplate(HighlightType.HydrationMismatched, COLORS.red);

/** Template for skipped hydration highlight. */
export const hydrationSkippedHighlightTemplate: HighlightTemplate<HydrationLabels> =
  createHydrationHighlightTemplate(HighlightType.HydrationSkipped, COLORS.grey);
