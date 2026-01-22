/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Tab, TabContent, TabList, TabPanel, Tabs} from '@angular/aria/tabs';
import {A11yModule} from '@angular/cdk/a11y';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {IS_SEARCH_DIALOG_OPEN, IconComponent, TextField} from '@angular/docs';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {CodeHighligher} from './code-highlighting/code-highlighter';
import {ControlFlowExample} from './components/control-flow/control-flow-example';
import {DeferrableViewsExample} from './components/deferrable-views-example/deferrable-views-example';
import {HydrationExample} from './components/hydration-example/hydration-example';
import {SignalsDemo} from './components/signals-demo/signals-demo';

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
  private readonly codeHighlighter = inject(CodeHighligher);

  protected readonly displaySearchDialog = inject(IS_SEARCH_DIALOG_OPEN);

  openSearch() {
    this.displaySearchDialog.set(true);
  }
}
