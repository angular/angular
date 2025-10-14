/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementProfile } from '../../../../../../../protocol';
import { FlamegraphNode } from './flamegraph-formatter';
export declare const SIMPLE_RECORD: {
    children: {
        children: never[];
        directives: {
            isComponent: boolean;
            isElement: boolean;
            name: string;
            lifecycle: {};
            outputs: {};
            changeDetection: number;
            changeDetected: boolean;
        }[];
        type: ElementProfile["type"];
    }[];
    directives: {
        isComponent: boolean;
        isElement: boolean;
        name: string;
        changeDetected: boolean;
        lifecycle: {
            ngDoCheck: number;
        };
        outputs: {};
        changeDetection: number;
    }[];
    type: ElementProfile["type"];
}[];
export declare const SIMPLE_FORMATTED_FLAMEGRAPH_RECORD: {
    value: number;
    label: string;
    changeDetected: boolean;
    children: {
        value: number;
        label: string;
        children: never[];
        instances: number;
        original: {
            children: never[];
            directives: {
                isComponent: boolean;
                isElement: boolean;
                name: string;
                lifecycle: {};
                outputs: {};
                changeDetection: number;
                changeDetected: boolean;
            }[];
            type: ElementProfile["type"];
        };
        changeDetected: boolean;
    }[];
    instances: number;
    original: {
        children: {
            children: never[];
            directives: {
                isComponent: boolean;
                isElement: boolean;
                name: string;
                lifecycle: {};
                outputs: {};
                changeDetection: number;
                changeDetected: boolean;
            }[];
            type: ElementProfile["type"];
        }[];
        directives: {
            isComponent: boolean;
            isElement: boolean;
            name: string;
            changeDetected: boolean;
            lifecycle: {
                ngDoCheck: number;
            };
            outputs: {};
            changeDetection: number;
        }[];
        type: ElementProfile["type"];
    };
}[];
export declare const SIMPLE_FORMATTED_TREE_MAP_RECORD: any[];
export declare const NESTED_RECORD: ElementProfile[];
export declare const NESTED_FORMATTED_FLAMEGRAPH_RECORD: FlamegraphNode[];
