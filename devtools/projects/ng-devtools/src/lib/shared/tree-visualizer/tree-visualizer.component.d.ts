/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementRef } from '@angular/core';
import { TreeD3Node, TreeNode, TreeVisualizerConfig } from './tree-visualizer';
export declare class TreeVisualizerComponent<T extends TreeNode = TreeNode> {
    protected readonly container: import("@angular/core").Signal<ElementRef<any>>;
    protected readonly group: import("@angular/core").Signal<ElementRef<any>>;
    readonly root: import("@angular/core").InputSignal<T>;
    protected readonly config: import("@angular/core").InputSignal<Partial<TreeVisualizerConfig<T>> | undefined>;
    protected readonly a11yTitle: import("@angular/core").InputSignal<string>;
    protected readonly a11yTitleId: string;
    protected readonly ready: import("@angular/core").OutputEmitterRef<void>;
    protected readonly render: import("@angular/core").OutputEmitterRef<{
        initial: boolean;
    }>;
    protected readonly nodeClick: import("@angular/core").OutputEmitterRef<TreeD3Node<T>>;
    protected readonly nodeMouseout: import("@angular/core").OutputEmitterRef<TreeD3Node<T>>;
    protected readonly nodeMouseover: import("@angular/core").OutputEmitterRef<TreeD3Node<T>>;
    panning: import("@angular/core").WritableSignal<boolean>;
    private initialRender;
    private visualizer?;
    constructor();
    get svg(): HTMLElement;
    snapToRoot(scale?: number): void;
    snapToNode(node: T, scale?: number): void;
    getNodeById(id: string): TreeD3Node<T> | null | undefined;
    private renderGraph;
}
