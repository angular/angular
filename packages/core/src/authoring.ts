/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Note: `input` and `model` are exported in `core.ts` due to:
// https://docs.google.com/document/d/1RXb1wYwsbJotO1KBgSDsAtKpduGmIHod9ADxuXcAvV4/edit?tab=t.0.

export {InputFunction} from './authoring/input/input';
export {InputOptions, InputOptionsWithoutTransform, InputOptionsWithTransform, InputSignal, InputSignalWithTransform, ɵINPUT_SIGNAL_BRAND_WRITE_TYPE} from './authoring/input/input_signal';
export {ɵUnwrapDirectiveSignalInputs} from './authoring/input/input_type_checking';
export {ModelFunction} from './authoring/model/model';
export {ModelOptions, ModelSignal} from './authoring/model/model_signal';
export {output as ɵoutput, OutputEmitter as ɵOutputEmitter, OutputOptions as ɵOutputOptions} from './authoring/output';
export {ContentChildFunction, ViewChildFunction} from './authoring/queries';
