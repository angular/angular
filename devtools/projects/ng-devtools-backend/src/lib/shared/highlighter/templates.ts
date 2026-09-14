/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HydrationStatus} from '../../../../../protocol';
import {AngularDevtoolsError} from '../utils/error';
import {HighlightTemplate, HighlightType, RgbColor} from './types';

const COLORS = {
  blue: [104, 182, 255],
  red: [255, 0, 64],
  grey: [128, 128, 128],
  green: [91, 201, 92],
} satisfies Record<string, RgbColor>;

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
const HYDRATION_SVG = new Path2D(
  'M12,2c-5.33,4.55-8,8.48-8,11.8c0,4.98,3.8,8.2,8,8.2s8-3.22,8-8.2C20,10.48,17.33,6.55,12,2z M12,20c-3.35,0-6-2.57-6-6.2 c0-2.34,1.95-5.44,6-9.14c4.05,3.7,6,6.79,6,9.14C18,17.43,15.35,20,12,20z M7.83,14c0.37,0,0.67,0.26,0.74,0.62 c0.41,2.22,2.28,2.98,3.64,2.87c0.43-0.02,0.79,0.32,0.79,0.75c0,0.4-0.32,0.73-0.72,0.75c-2.13,0.13-4.62-1.09-5.19-4.12 C7.01,14.42,7.37,14,7.83,14z',
);

const HYDRATION_SKIPPED_SVG = new Path2D(
  'M21.19,21.19L2.81,2.81L1.39,4.22l4.2,4.2c-1,1.31-1.6,2.94-1.6,4.7C4,17.48,7.58,21,12,21c1.75,0,3.36-0.56,4.67-1.5 l3.1,3.1L21.19,21.19z M12,19c-3.31,0-6-2.63-6-5.87c0-1.19,0.36-2.32,1.02-3.28L12,14.83V19z M8.38,5.56L12,2l5.65,5.56l0,0 C19.1,8.99,20,10.96,20,13.13c0,1.18-0.27,2.29-0.74,3.3L12,9.17V4.81L9.8,6.97L8.38,5.56z',
);

const HYDRATION_ERROR_SVG = new Path2D(
  'M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
);

type HydrationLabels = {
  'icon': (status: NonNullable<HydrationStatus>['status']) => Path2D;
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
        offset: 'strict-inset',
        content: (type: NonNullable<HydrationStatus>['status']) => {
          let svg: Path2D;
          if (type === 'hydrated') {
            svg = HYDRATION_SVG;
          } else if (type === 'mismatched') {
            svg = HYDRATION_ERROR_SVG;
          } else if (type === 'skipped') {
            svg = HYDRATION_SKIPPED_SVG;
          } else {
            throw new AngularDevtoolsError(`No icon specified for type "${type}"`);
          }

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

//
// Change detection highlight
//

type CdHighlightLabels = {
  'component-name': (name: string) => string;
  'cycles-count': (count: number) => string;
};

export const changeDetectionHighlightTemplate: HighlightTemplate<CdHighlightLabels> = {
  type: HighlightType.ChangeDetection,
  overlayColor: COLORS.green,
  labelsType: 'static',
  style: 'outline',
  ttl: 1000,
  labels: {
    ['component-name']: {
      x: 'left',
      offset: 'inset',
      content: (name: string) => `<${name}>`,
    },
    ['cycles-count']: {
      x: 'right',
      offset: 'inset',
      content: (count: number) => `x${count}`,
    },
  },
};
