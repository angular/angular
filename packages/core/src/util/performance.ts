/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const markedFeatures = new Set<string>();

// tslint:disable:ban
/**
 * A guarded `performance.mark` for feature marking.
 *
 * This method exists because while all supported browser and node.js version supported by Angular
 * support performance.mark API. This is not the case for other environments such as JSDOM and
 * Cloudflare workers.
 */
export function performanceMarkFeature(feature: string): void {
  if (markedFeatures.has(feature)) {
    return;
  }
  markedFeatures.add(feature);
  performance?.mark?.('mark_feature_usage', {detail: {feature}});
}
