/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';

import {ProfilerImportDialogComponent} from './profiler-import-dialog.component';
import {ProfilerComponent} from './profiler.component';
import {TimelineModule} from './timeline/timeline.module';

@NgModule({
  declarations: [ProfilerComponent, ProfilerImportDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule,
    FormsModule,
    TimelineModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
  ],
  exports: [ProfilerComponent],
})
export class ProfilerModule {
}
