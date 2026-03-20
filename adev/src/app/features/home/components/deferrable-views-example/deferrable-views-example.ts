/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {CodeBlock} from '../code-block/code-block';

@Component({
  selector: 'adev-defer-example',
  imports: [RouterLink, CodeBlock],
  templateUrl: './deferrable-views-example.html',
  styleUrls: ['./deferrable-views-example.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeferrableViewsExample {
  exampleHtml = exampleHtml;
  exampleTs = exampleTs;
}

const exampleTs = `
@Component({
  // importing the component that will be loaded lazily
  imports: [DataVisualization],
})
export class DataVisualizationPage {
  dataService = inject(DataService);
  dataSet = this.dataService.getData();
}
`.trim();

const exampleHtml = `
<section>
  <h2>Data visualization</h2>
  @defer {
    <!-- lazy loading a heavy component -->
    <app-data-visualization [data]="dataSet">
  }
</section>
`.trim();
