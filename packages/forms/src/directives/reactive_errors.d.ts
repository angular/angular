/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare function controlParentException(nameOrIndex: string | number | null): Error;
export declare function ngModelGroupException(): Error;
export declare function missingFormException(): Error;
export declare function groupParentException(): Error;
export declare function arrayParentException(): Error;
export declare const disabledAttrWarning = "\n  It looks like you're using the disabled attribute with a reactive form directive. If you set disabled to true\n  when you set up this control in your component class, the disabled attribute will actually be set in the DOM for\n  you. We recommend using this approach to avoid 'changed after checked' errors.\n\n  Example:\n  // Specify the `disabled` property at control creation time:\n  form = new FormGroup({\n    first: new FormControl({value: 'Nancy', disabled: true}, Validators.required),\n    last: new FormControl('Drew', Validators.required)\n  });\n\n  // Controls can also be enabled/disabled after creation:\n  form.get('first')?.enable();\n  form.get('last')?.disable();\n";
export declare const asyncValidatorsDroppedWithOptsWarning = "\n  It looks like you're constructing using a FormControl with both an options argument and an\n  async validators argument. Mixing these arguments will cause your async validators to be dropped.\n  You should either put all your validators in the options object, or in separate validators\n  arguments. For example:\n\n  // Using validators arguments\n  fc = new FormControl(42, Validators.required, myAsyncValidator);\n\n  // Using AbstractControlOptions\n  fc = new FormControl(42, {validators: Validators.required, asyncValidators: myAV});\n\n  // Do NOT mix them: async validators will be dropped!\n  fc = new FormControl(42, {validators: Validators.required}, /* Oops! */ myAsyncValidator);\n";
export declare function ngModelWarning(directiveName: string): string;
export declare function noControlsError(isFormGroup: boolean): string;
export declare function missingControlError(isFormGroup: boolean, key: string | number): string;
export declare function missingControlValueError(isFormGroup: boolean, key: string | number): string;
