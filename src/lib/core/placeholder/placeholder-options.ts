import { InjectionToken } from '@angular/core';

/** InjectionToken that can be used to specify the global placeholder options. */
export const MD_PLACEHOLDER_GLOBAL_OPTIONS =
  new InjectionToken<PlaceholderOptions>('md-placeholder-global-options');

/** Type for the available floatPlaceholder values. */
export type FloatPlaceholderType = 'always' | 'never' | 'auto';

export interface PlaceholderOptions {
  float?: FloatPlaceholderType;
}
