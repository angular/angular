/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from './animation/animation';
export * from './common-behaviors/index';
export * from './datetime/index';
export * from './error/error-options';
export * from './gestures/gesture-annotations';
export * from './gestures/gesture-config';
export * from './line/line';
export * from './option/index';
export * from './label/label-options';
export * from './ripple/index';
export * from './selection/index';
export * from './style/index';

/** @deprecated */
export {MAT_LABEL_GLOBAL_OPTIONS as MAT_PLACEHOLDER_GLOBAL_OPTIONS} from './label/label-options';

/** @deprecated */
export {FloatLabelType as FloatPlaceholderType} from './label/label-options';

/** @deprecated */
export {LabelOptions as PlaceholderOptions} from './label/label-options';

// TODO: don't have this
export * from './testing/month-constants';
