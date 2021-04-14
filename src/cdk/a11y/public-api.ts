/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export * from './aria-describer/aria-describer';
export * from './key-manager/activedescendant-key-manager';
export * from './key-manager/focus-key-manager';
export * from './key-manager/list-key-manager';
export * from './focus-trap/configurable-focus-trap';
export * from './focus-trap/configurable-focus-trap-config';
export * from './focus-trap/configurable-focus-trap-factory';
export * from './focus-trap/event-listener-inert-strategy';
export * from './focus-trap/focus-trap';
export * from './focus-trap/focus-trap-inert-strategy';
export * from './interactivity-checker/interactivity-checker';
export {
  InputModality,
  InputModalityDetector,
  InputModalityDetectorOptions,
  INPUT_MODALITY_DETECTOR_DEFAULT_OPTIONS,
  INPUT_MODALITY_DETECTOR_OPTIONS,
} from './input-modality/input-modality-detector';
export * from './live-announcer/live-announcer';
export * from './live-announcer/live-announcer-tokens';
export * from './focus-monitor/focus-monitor';
export * from './fake-event-detection';
export * from './a11y-module';
export {
  HighContrastModeDetector,
  HighContrastMode,
} from './high-contrast-mode/high-contrast-mode-detector';
