/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementRef } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { FlatNode } from '../component-data-source';
export type NodeTextMatch = {
    startIdx: number;
    endIdx: number;
};
export declare class TreeNodeComponent {
    private readonly renderer;
    private readonly doc;
    protected readonly nodeName: import("@angular/core").Signal<ElementRef<any>>;
    protected readonly node: import("@angular/core").InputSignal<FlatNode>;
    protected readonly selectedNode: import("@angular/core").InputSignal<FlatNode | null>;
    protected readonly highlightedId: import("@angular/core").InputSignal<number | null>;
    protected readonly treeControl: import("@angular/core").InputSignal<FlatTreeControl<FlatNode, FlatNode>>;
    protected readonly textMatches: import("@angular/core").InputSignal<NodeTextMatch[]>;
    protected readonly selectNode: import("@angular/core").OutputEmitterRef<FlatNode>;
    protected readonly selectDomElement: import("@angular/core").OutputEmitterRef<FlatNode>;
    protected readonly highlightNode: import("@angular/core").OutputEmitterRef<FlatNode>;
    protected readonly removeHighlight: import("@angular/core").OutputEmitterRef<void>;
    protected readonly paddingLeft: import("@angular/core").Signal<string>;
    protected readonly isElement: import("@angular/core").Signal<boolean | null>;
    protected readonly directivesArrayString: import("@angular/core").Signal<string>;
    private readonly nodeNameString;
    private matchedText;
    protected readonly PADDING_LEFT_STEP = 15;
    constructor();
    protected get isSelected(): boolean;
    protected get isHighlighted(): boolean;
    private handleMatchedText;
    private buildMatchedTextElement;
    private appendText;
}
