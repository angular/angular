/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { PipeTransform } from '@angular/core';
/**
 * Transforms text to all lower case.
 *
 * @see {@link UpperCasePipe}
 * @see {@link TitleCasePipe}
 * @usageNotes
 *
 * The following example defines a view that allows the user to enter
 * text, and then uses the pipe to convert the input text to all lower case.
 *
 * {@example common/pipes/ts/lowerupper_pipe.ts region='LowerUpperPipe'}
 *
 * @ngModule CommonModule
 * @publicApi
 */
export declare class LowerCasePipe implements PipeTransform {
    /**
     * @param value The string to transform to lower case.
     */
    transform(value: string): string;
    transform(value: null | undefined): null;
    transform(value: string | null | undefined): string | null;
}
/**
 * Transforms text to title case.
 * Capitalizes the first letter of each word and transforms the
 * rest of the word to lower case.
 * Words are delimited by any whitespace character, such as a space, tab, or line-feed character.
 *
 * @see {@link LowerCasePipe}
 * @see {@link UpperCasePipe}
 *
 * @usageNotes
 * The following example shows the result of transforming various strings into title case.
 *
 * {@example common/pipes/ts/titlecase_pipe.ts region='TitleCasePipe'}
 *
 * @ngModule CommonModule
 * @publicApi
 */
export declare class TitleCasePipe implements PipeTransform {
    /**
     * @param value The string to transform to title case.
     */
    transform(value: string): string;
    transform(value: null | undefined): null;
    transform(value: string | null | undefined): string | null;
}
/**
 * Transforms text to all upper case.
 * @see {@link LowerCasePipe}
 * @see {@link TitleCasePipe}
 *
 * @ngModule CommonModule
 * @publicApi
 */
export declare class UpperCasePipe implements PipeTransform {
    /**
     * @param value The string to transform to upper case.
     */
    transform(value: string): string;
    transform(value: null | undefined): null;
    transform(value: string | null | undefined): string | null;
}
