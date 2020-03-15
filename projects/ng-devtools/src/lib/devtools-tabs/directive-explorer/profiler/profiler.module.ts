import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

import { ProfilerComponent } from './profiler.component';
import { RecordingModalComponent } from './recording/recording-modal/recording-modal.component';
import { TimelineModule } from './recording/timeline/timeline.module';
import { RecordingDialogComponent } from './recording/recording-modal/recording-dialog/recording-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { ProfilerImportDialogComponent } from './profiler-import-dialog/profiler-import-dialog.component';

@NgModule({
  declarations: [ProfilerComponent, RecordingModalComponent, RecordingDialogComponent, ProfilerImportDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatSelectModule,
    FormsModule,
    MatProgressBarModule,
    TimelineModule,
    MatButtonModule,
  ],
  exports: [ProfilerComponent],
  entryComponents: [ProfilerImportDialogComponent],
})
export class ProfilerModule {}
