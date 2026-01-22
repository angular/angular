/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import { Tab, TabContent, TabList, TabPanel, Tabs } from '@angular/aria/tabs';
import { A11yModule } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { IS_SEARCH_DIALOG_OPEN, IconComponent, TextField } from '@angular/docs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CodeHighligher } from './code-highlighting/code-highlighter';
import { CodeBlock } from './components/code-block/code-block';

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
    CodeBlock,
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

  // Source signals for state.
  items = signal([
    'Apple',
    'Apricot',
    'Avocado',
    'Banana',
    'Blueberry',
    'Cherry',
    'Date',
    'Dragonfruit',
  ]);
  searchTerm = signal('');

  // A computed signal that derives the filtered list.
  // It automatically re-runs when a dependency changes.
  filteredItems = computed(() =>
    this.items().filter((item) => item.toLowerCase().includes(this.searchTerm().toLowerCase())),
  );

  openSearch() {
    this.displaySearchDialog.set(true);
  }

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}
