import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

import { ProfilerComponent } from './profiler.component';
import { TimeTravelModule } from './time-travel/time-travel.module';
import { RecordingComponent, RecordingDialogComponent } from './recording.component';
import { TimelineModule } from './recording/timeline/timeline.module';

@NgModule({
  declarations: [ProfilerComponent, RecordingComponent, RecordingDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    TimeTravelModule,
    MatSelectModule,
    FormsModule,
    MatProgressBarModule,
    TimelineModule,
  ],
  exports: [ProfilerComponent],
})
export class ProfilerModule {}
