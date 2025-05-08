/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, input} from '@angular/core';
import {SerializedInjectedService} from '../../../../../../../protocol';
import {ResolutionPathComponent} from '../../../dependency-injection/resolution-path/resolution-path.component';
import {MatTooltip} from '@angular/material/tooltip';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  selector: 'ng-dependency-viewer',
  templateUrl: './dependency-viewer.component.html',
  styleUrl: './dependency-viewer.component.scss',
  imports: [MatExpansionModule, MatTooltip, ResolutionPathComponent],
})
export class DependencyViewerComponent {
  readonly dependency = input.required<SerializedInjectedService>();
}
