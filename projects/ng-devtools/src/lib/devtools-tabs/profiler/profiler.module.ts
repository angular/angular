import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

import { ProfilerComponent } from './profiler.component';
import { TimelineModule } from './recording/timeline/timeline.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ProfilerImportDialogComponent } from './profiler-import-dialog/profiler-import-dialog.component';
import { MatIconModule } from '@angular/material/icon';

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
  ],
  exports: [ProfilerComponent],
  entryComponents: [ProfilerImportDialogComponent],
})
export class ProfilerModule {}
