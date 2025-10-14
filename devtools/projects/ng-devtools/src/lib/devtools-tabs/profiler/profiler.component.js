/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MessageBus} from '../../../../../protocol';
import {Subject} from 'rxjs';
import {FileApiService} from './file-api-service';
import {ProfilerImportDialogComponent} from './profiler-import-dialog/profiler-import-dialog.component';
import {RecordingTimelineComponent} from './recording-timeline/recording-timeline.component';
import {ButtonComponent} from '../../shared/button/button.component';
const SUPPORTED_VERSIONS = [1];
const PROFILER_VERSION = 1;
let ProfilerComponent = class ProfilerComponent {
  constructor() {
    this.state = signal('idle');
    this.stream = new Subject();
    // We collect this buffer so we can have it available for export.
    this._buffer = [];
    this._fileApiService = inject(FileApiService);
    this._messageBus = inject(MessageBus);
    this.dialog = inject(MatDialog);
    this._fileApiService.uploadedData.subscribe((importedFile) => {
      if (importedFile.error) {
        console.error('Could not process uploaded file');
        console.error(importedFile.error);
        this.dialog.open(ProfilerImportDialogComponent, {
          width: '600px',
          data: {status: 'ERROR', errorMessage: importedFile.error},
        });
        return;
      }
      if (!SUPPORTED_VERSIONS.includes(importedFile.version)) {
        const processDataDialog = this.dialog.open(ProfilerImportDialogComponent, {
          width: '600px',
          data: {
            importedVersion: importedFile.version,
            profilerVersion: PROFILER_VERSION,
            status: 'INVALID_VERSION',
          },
        });
        processDataDialog.afterClosed().subscribe((result) => {
          if (result) {
            this.state.set('visualizing');
            this._buffer = importedFile.buffer;
            setTimeout(() => this.stream.next(importedFile.buffer));
          }
        });
      } else {
        this.state.set('visualizing');
        this._buffer = importedFile.buffer;
        setTimeout(() => this.stream.next(importedFile.buffer));
      }
    });
    this._messageBus.on('profilerResults', (remainingRecords) => {
      if (remainingRecords.duration > 0 && remainingRecords.source) {
        this.stream.next([remainingRecords]);
        this._buffer.push(remainingRecords);
      }
    });
    this._messageBus.on('sendProfilerChunk', (chunkOfRecords) => {
      this.stream.next([chunkOfRecords]);
      this._buffer.push(chunkOfRecords);
    });
  }
  startRecording() {
    this.state.set('recording');
    this._messageBus.emit('startProfiling');
  }
  stopRecording() {
    this.state.set('visualizing');
    this._messageBus.emit('stopProfiling');
    this.stream.complete();
  }
  exportProfilerResults() {
    const fileToExport = {
      version: PROFILER_VERSION,
      buffer: this._buffer,
    };
    this._fileApiService.saveObjectAsJSON(fileToExport);
  }
  importProfilerResults(event) {
    this._fileApiService.publishFileUpload(event);
  }
  discardRecording() {
    this.stream = new Subject();
    this.state.set('idle');
    this._buffer = [];
  }
};
ProfilerComponent = __decorate(
  [
    Component({
      selector: 'ng-profiler',
      templateUrl: './profiler.component.html',
      styleUrls: ['./profiler.component.scss'],
      imports: [MatTooltip, MatIcon, RecordingTimelineComponent, ButtonComponent, MatProgressBar],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  ProfilerComponent,
);
export {ProfilerComponent};
//# sourceMappingURL=profiler.component.js.map
