/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Defines one breakpoint (in px) between mobile and desktop sizing.
export const BREAKPOINT = 1000;

// Defines maximum application size (in px) that can be rendered on a page.
// If a viewport width is bigger than this size, we limit the width to this value.
export const MAX_APP_WIDTH = 2560;

// Defines the "Build for everyone" heading height ratio.
// The computed CSS heading size (in px) is multiplied by this value to compensate for the
// difference in height of the MSDF texture.
export const BUILD_TEXT_HEIGHT_RATIO = 0.88;

export const SCALE_DIV = '.adev-scale';
export const LINES_TEXT = '.adev-lines-text';
export const LINES_DIV = '.adev-lines';
export const BUILD_TEXT = '.adev-build-text';
export const CTA = '.adev-cta';
export const ARROW = '.adev-arrow';
export const SCALE_TEXT = '.adev-scale-text';
export const CANVAS = '.adev-canvas';
export const MOVING_LOGO = '.adev-logo';

export const HEADER_CLASS_NAME = 'adev-header';
export const WEBGL_CLASS_NAME = 'adev-webgl';
export const LOADED_CLASS_NAME = 'adev-loaded';
