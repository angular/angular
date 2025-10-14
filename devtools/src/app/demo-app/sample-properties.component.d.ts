/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementRef } from '@angular/core';
import { SampleService } from './sample.service';
export declare class SamplePropertiesComponent {
    readonly elementRef: import("@angular/core").Signal<ElementRef<any> | undefined>;
    exampleService: SampleService;
    exampleBoolean: boolean;
    exampleString: string;
    exampleSymbol: symbol;
    exampleNumber: number;
    exampleBigint: bigint;
    exampleUndefined: undefined;
    exampleNull: null;
    exampleObject: {
        name: string;
        age: number;
    };
    exampleArray: (number | number[] | {
        name: string;
        age: number;
        skills: string[];
    })[];
    exampleSet: Set<number>;
    exampleMap: Map<unknown, unknown>;
    exampleDate: Date;
    exampleFunction: () => string;
    signalPrimitive: import("@angular/core").WritableSignal<number>;
    computedPrimitive: import("@angular/core").Signal<number>;
    signalObject: import("@angular/core").WritableSignal<{
        name: string;
        age: number;
    }>;
    computedObject: import("@angular/core").Signal<{
        age: number;
        name: string;
    }>;
    signalSymbol: symbol;
}
