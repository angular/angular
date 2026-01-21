/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  Renderer2,
  viewChildren,
} from '@angular/core';

let idCounter = 0;

/**
 * A simple tabs implementation with proper aria roles.
 *
 * TODO: Consider migrate to Angular Aria Tabs pattern to enable keyboard navigation.
 */
@Component({
  selector: 'docs-tab-group',
  templateUrl: './tab-group.component.html',
  styleUrls: ['./tab-group.component.scss'],
  host: {
    class: 'docs-tab-group',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabGroup {
  private readonly _renderer = inject(Renderer2);
  private readonly _tabpanels = viewChildren<ElementRef<HTMLDivElement>>('tabpanel');

  readonly tabs = input<{label: string; panel: HTMLElement}[]>();

  readonly computedTabs = computed(() => {
    return (
      this.tabs()?.map((tab) => {
        const id = idCounter++;

        return {
          tabId: `docs-tab-${id}`,
          tabPanelId: `docs-tab-panel-${id}`,
          label: tab.label,
          panel: tab.panel,
        };
      }) ?? []
    );
  });

  readonly selectedTab = linkedSignal(() => this.computedTabs()[0]?.tabId);

  constructor() {
    afterRenderEffect(() => {
      const tabs = this.computedTabs();
      const tabpanels = this._tabpanels();
      if (tabpanels.length !== tabs.length) return;

      for (let i = 0; i < tabs.length; i++) {
        tabpanels[i].nativeElement.innerHTML = '';
        this._renderer.appendChild(tabpanels[i].nativeElement, tabs[i].panel);
        // Reset class name and attributes.
        tabs[i].panel.removeAttribute('class');
        tabs[i].panel.removeAttribute('label');
      }
    });
  }
}
