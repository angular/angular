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
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';

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
  entryComponents: [ProfilerImportDialogComponent],
})
export class ProfilerModule {
}
