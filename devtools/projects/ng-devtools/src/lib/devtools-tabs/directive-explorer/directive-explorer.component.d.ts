/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementRef } from '@angular/core';
import { DebugSignalGraphNode, DevToolsNode, DirectivePosition, ElementPosition } from '../../../../../protocol';
import { FlatNode } from './directive-forest/component-data-source';
import { DirectiveForestComponent } from './directive-forest/directive-forest.component';
import { IndexedNode } from './directive-forest/index-forest';
import { FlatNode as PropertyFlatNode } from './property-resolver/element-property-resolver';
import { ResponsiveSplitConfig } from '../../shared/split/responsive-split.directive';
import { Direction } from '../../shared/split/interface';
import { SignalGraphManager } from './signal-graph/signal-graph-manager';
export declare class DirectiveExplorerComponent {
    readonly showCommentNodes: import("@angular/core").InputSignal<boolean>;
    isHydrationEnabled: boolean;
    readonly toggleInspector: import("@angular/core").OutputEmitterRef<void>;
    readonly directiveForest: import("@angular/core").Signal<DirectiveForestComponent>;
    readonly splitElementRef: import("@angular/core").Signal<ElementRef<any>>;
    readonly directiveForestSplitArea: import("@angular/core").Signal<ElementRef<any>>;
    readonly currentSelectedElement: import("@angular/core").WritableSignal<IndexedNode | null>;
    readonly forest: import("@angular/core").WritableSignal<DevToolsNode<import("../../../../../protocol").DirectiveType, import("../../../../../protocol").ComponentType>[]>;
    readonly splitDirection: import("@angular/core").WritableSignal<"horizontal" | "vertical">;
    readonly parents: import("@angular/core").WritableSignal<FlatNode[] | null>;
    readonly showHydrationNodeHighlights: import("@angular/core").WritableSignal<boolean>;
    readonly signalsOpen: import("@angular/core").WritableSignal<boolean>;
    private _clickedElement;
    private _refreshRetryTimeout;
    private readonly _appOperations;
    private readonly _messageBus;
    private readonly _propResolver;
    private readonly _frameManager;
    private readonly platform;
    private readonly snackBar;
    protected readonly signalGraph: SignalGraphManager;
    protected readonly preselectedSignalNodeId: import("@angular/core").WritableSignal<string | null>;
    protected readonly responsiveSplitConfig: ResponsiveSplitConfig;
    protected readonly forestSplitSize: import("@angular/core").WritableSignal<number>;
    protected readonly signalGraphSplitSize: import("@angular/core").WritableSignal<number>;
    private readonly currentElementPos;
    constructor();
    private isNonTopLevelFirefoxFrame;
    handleNodeSelection(node: IndexedNode | null): void;
    subscribeToBackendEvents(): void;
    refresh(): void;
    viewSource(directiveName: string): void;
    handleSelectDomElement(node: IndexedNode): void;
    highlight(node: FlatNode): void;
    unhighlight(): void;
    private _constructViewQuery;
    private _getPropertyQuery;
    highlightComponent(position: ElementPosition): void;
    removeComponentHighlight(): void;
    handleSelect(node: FlatNode): void;
    handleSetParents(parents: FlatNode[] | null): void;
    inspect({ node, directivePosition, }: {
        node: PropertyFlatNode;
        directivePosition: DirectivePosition;
    }): void;
    hightlightHydrationNodes(): void;
    removeHydrationNodesHightlights(): void;
    refreshHydrationNodeHighlightsIfNeeded(): void;
    showSignalGraph(node: DebugSignalGraphNode | null): void;
    onResponsiveSplitDirChange(direction: Direction): void;
}
