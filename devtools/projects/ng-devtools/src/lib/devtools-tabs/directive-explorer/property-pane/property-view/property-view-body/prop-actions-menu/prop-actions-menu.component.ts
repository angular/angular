/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  AfterRenderRef,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  Renderer2,
  untracked,
  viewChild,
} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Menu, MenuContent, MenuItem, MenuTrigger} from '@angular/aria/menu';
import {CdkConnectedOverlay, ConnectedPosition} from '@angular/cdk/overlay';

import {FlatNode} from '../../../../../../shared/object-tree-explorer/object-tree-types';
import {SUPPORTED_APIS} from '../../../../../../application-providers/supported_apis';
import {DirectivePropertyResolver} from '../../../../property-resolver/directive-property-resolver';
import {SignalGraphManager} from '../../../../signal-graph-manager/signal-graph-manager';
import {DevtoolsSignalGraphNode} from '../../../../../../shared/signal-graph';

// Based on the current design.
// Update accordingly if that changes.
const CTX_MENU_ITEM_HEIGHT = 22;

const CTX_MENU_POSITIONS: ConnectedPosition[] = [
  {
    // Primary: bottom-left
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
    offsetY: 4,
  },
  {
    // Fallback: bottom-right
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
    offsetY: 4,
  },
  {
    // Fallback: top-left
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
    offsetY: -4,
  },
  {
    // Fallback: top-right
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
    offsetY: -4,
  },
];

interface AvailableActions {
  logToConsole: boolean;
  showSignalGraph: boolean;
}

@Component({
  selector: 'ng-prop-actions-menu',
  templateUrl: './prop-actions-menu.component.html',
  styleUrl: './prop-actions-menu.component.scss',
  imports: [MatTooltip, MatIcon, Menu, MenuContent, MenuItem, MenuTrigger, CdkConnectedOverlay],
})
export class PropActionsMenuComponent {
  private readonly signalGraph = inject(SignalGraphManager);
  private readonly snackBar = inject(MatSnackBar);
  private readonly supportedApis = inject(SUPPORTED_APIS);
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly injector = inject(Injector);

  protected readonly ctxMenu = viewChild<Menu<unknown>>('ctxMenu');
  protected readonly ctxMenuTrigger = viewChild<MenuTrigger<unknown>>('ctxMenuTrigger');
  protected readonly ctxMenuOverlay = viewChild<CdkConnectedOverlay>('ctxMenuOverlay');

  protected readonly node = input.required<FlatNode>();
  protected readonly controller = input.required<DirectivePropertyResolver>();
  protected readonly showSignalGraph = output<DevtoolsSignalGraphNode>();

  protected readonly availableActions = computed<AvailableActions>(() => {
    const node = this.node();
    const supportedApis = this.supportedApis();

    return {
      logToConsole: node.level === 0,
      showSignalGraph:
        supportedApis.signalPropertiesInspection &&
        supportedApis.signals &&
        !!this.getSignalNode(node),
    };
  });

  protected readonly availableActionsCount = computed(
    () => Object.values(this.availableActions()).filter((a) => a).length,
  );

  protected readonly CTX_MENU_POSITIONS = CTX_MENU_POSITIONS;
  protected readonly CTX_MENU_ITEM_HEIGHT = CTX_MENU_ITEM_HEIGHT;

  constructor() {
    let preventScrollEffect: AfterRenderRef | undefined;

    effect((onCleanup) => {
      // Eligible for a context menu.
      if (this.availableActionsCount() > 1) {
        untracked(() => {
          // Load the prevent scroll effect only if needed.
          // Realistically, it should be called once.
          preventScrollEffect = this.preventScrollOnCtxExpanded();
        });
      }

      onCleanup(() => {
        preventScrollEffect?.destroy();
      });
    });
  }

  showInSignalGraph(e: Event): void {
    e.stopPropagation();

    const signalNode = this.getSignalNode(this.node())!;
    this.showSignalGraph.emit(signalNode);
    this.ctxMenu()?.close();
  }

  logValue(e: Event): void {
    e.stopPropagation();

    const node = this.node();
    this.controller().logValue(node);
    this.snackBar.open(`Logged value of '${node.prop.name}' to the console`, 'Dismiss', {
      duration: 2000,
      horizontalPosition: 'left',
    });
    this.ctxMenu()?.close();
  }

  private getSignalNode(node: FlatNode): DevtoolsSignalGraphNode | null {
    if (node.prop.descriptor.containerType?.includes('Signal')) {
      return this.signalGraph.graph()?.nodes.find((sn) => sn.label === node.prop.name) ?? null;
    }
    return null;
  }

  private preventScrollOnCtxExpanded(): AfterRenderRef {
    let scrollableAncestor: HTMLElement | null | undefined;

    return afterRenderEffect(
      {
        earlyRead: () => {
          if (scrollableAncestor === undefined && this.ctxMenuTrigger()?.expanded()) {
            // Traverse the DOM for the scrollable ancestor once,
            // only if the context menu is opened.
            scrollableAncestor = this.getScrollableAncestor();
          }
        },
        write: () => {
          // Note: We intentially don't abort the execution with an
          // `if (!scrollableAncestor) return` check. expanded() needs to be
          // reachable in the very beginning to ensure that the write phase
          // is always executed when the signal updates.
          if (this.ctxMenuTrigger()?.expanded()) {
            // We want to disable scrolling when the user opens the menu.
            // Instead of setting `overflow: hidden`, we use `pointer-events`
            // to avoid the content displacement caused by `overflow: hidden`,
            // that is, the disappearing scroll bar.
            // The context menu is managed by CDK Overlay outside of this component,
            // so it's safe to do that.
            if (scrollableAncestor) {
              this.renderer.setStyle(scrollableAncestor, 'pointer-events', 'none');
            }
          } else if (scrollableAncestor) {
            this.renderer.removeStyle(scrollableAncestor, 'pointer-events');
          }
        },
      },
      {injector: this.injector},
    );
  }

  private getScrollableAncestor(): HTMLElement | null {
    const el = this.elementRef.nativeElement as HTMLElement;
    let ancestor = el.parentElement;

    while (ancestor) {
      if (ancestor.scrollHeight > ancestor.clientHeight) {
        return ancestor;
      }
      ancestor = ancestor.parentElement;
    }

    return null;
  }
}
