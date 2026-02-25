/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Tab, TabContent, TabList, TabPanel, Tabs} from '@angular/aria/tabs';
import {A11yModule} from '@angular/cdk/a11y';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {IS_SEARCH_DIALOG_OPEN, IconComponent, TextField} from '@angular/docs';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {ControlFlowExample} from './components/control-flow/control-flow-example';
import {DeferrableViewsExample} from './components/deferrable-views-example/deferrable-views-example';
import {HydrationExample} from './components/hydration-example/hydration-example';
import {SignalsDemo} from './components/signals-demo/signals-demo';

const FEATURE_TAB = {
  signals: 'signals',
  controlFlow: 'control-flow',
  deferrableViews: 'deferrable-views',
  hydration: 'hydration',
} as const;

@Component({
  selector: 'adev-home',
  imports: [
    RouterLink,
    TextField,
    TabList,
    Tab,
    Tabs,
    TabPanel,
    TabContent,
    IconComponent,
    A11yModule,
    SignalsDemo,
    ControlFlowExample,
    DeferrableViewsExample,
    HydrationExample,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Home {
  private readonly activatedRoute = inject(ActivatedRoute);
  protected readonly isUwu = 'uwu' in this.activatedRoute.snapshot.queryParams;

  protected readonly displaySearchDialog = inject(IS_SEARCH_DIALOG_OPEN);

  protected readonly FEATURE_TAB = FEATURE_TAB;
  protected readonly selectedFeatureTab = signal<keyof typeof FEATURE_TAB>(FEATURE_TAB.signals);
  protected readonly featuresSection = viewChild<ElementRef>('featuresSection');

  constructor() {
    let lastFeatureTab = this.selectedFeatureTab();

    afterRenderEffect({
      read: () => {
        const featureTab = this.selectedFeatureTab();
        if (lastFeatureTab !== featureTab) {
          this.featuresSection()?.nativeElement.scrollIntoView();
          lastFeatureTab = featureTab;
        }
      },
    });
  }

  openSearch() {
    this.displaySearchDialog.set(true);
  }
}
