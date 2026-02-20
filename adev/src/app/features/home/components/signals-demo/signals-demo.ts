/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {CodeBlock} from '../code-block/code-block';

@Component({
  selector: 'adev-signals-demo',
  imports: [RouterLink, CodeBlock],
  templateUrl: './signals-demo.html',
  styleUrls: ['./signals-demo.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalsDemo {
  tsExample = tsExample;
  htmlExample = htmlExample;

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

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}

const tsExample = `
// Source signals for state.
items = signal(['Apple', 'Banana', /*...*/ ]);
searchTerm = signal('');
// A computed signal that derives the filtered list.
// It automatically re-runs when a dependency changes.
filteredItems = computed(() => 
  this.items().filter(item =>
    item.toLowerCase().includes (
       this.searchTerm().toLowerCase()
    )
  )
) ;
`.trim();

const htmlExample = `
<input [value]="searchTerm()" (input)="searchTerm.set($event)" />
<ul>
  @for (item of filteredItems(); track item) {
    <li>{{ item }}</Li>
  }
</ul>
`.trim();
