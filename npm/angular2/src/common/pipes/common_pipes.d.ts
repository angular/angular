/**
 * @module
 * @description
 * This module provides a set of common Pipes.
 */
import { AsyncPipe } from './async_pipe';
import { SlicePipe } from './slice_pipe';
import { ReplacePipe } from './replace_pipe';
import { I18nPluralPipe } from './i18n_plural_pipe';
import { I18nSelectPipe } from './i18n_select_pipe';
/**
 * A collection of Angular core pipes that are likely to be used in each and every
 * application.
 *
 * This collection can be used to quickly enumerate all the built-in pipes in the `pipes`
 * property of the `@Component` decorator.
 */
export declare const COMMON_PIPES: (typeof AsyncPipe | typeof SlicePipe | typeof ReplacePipe | typeof I18nPluralPipe | typeof I18nSelectPipe)[];
