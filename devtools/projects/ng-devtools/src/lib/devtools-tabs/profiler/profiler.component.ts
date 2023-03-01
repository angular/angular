/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {Events, MessageBus, ProfilerFrame} from 'protocol';
import {Subject, Subscription} from 'rxjs';

import {FileApiService} from './file-api-service';
import {ProfilerImportDialogComponent} from './profiler-import-dialog.component';

type State = 'idle'|'recording'|'visualizing';

const SUPPORTED_VERSIONS = [1];
const PROFILER_VERSION = 1;

@Component({
  selector: 'ng-profiler',
  templateUrl: './profiler.component.html',
  styleUrls: ['./profiler.component.scss'],
})
export class ProfilerComponent implements OnInit, OnDestroy {
  state: State = 'idle';
  stream = new Subject<ProfilerFrame[]>();

  private _fileUploadSubscription: Subscription;

  // We collect this buffer so we can have it available for export.
  private _buffer: ProfilerFrame[] = [];

  constructor(
      private _fileApiService: FileApiService, private _messageBus: MessageBus<Events>,
      public dialog: MatDialog) {}

  startRecording(): void {
    this.state = 'recording';
    this._messageBus.emit('startProfiling');
  }

  stopRecording(): void {
    this.state = 'visualizing';
    this._messageBus.emit('stopProfiling');
    this.stream.complete();
  }

  ngOnInit(): void {
    this._messageBus.on('profilerResults', (remainingRecords) => {
      if (remainingRecords.duration > 0 && remainingRecords.source) {
        this.stream.next([remainingRecords]);
        this._buffer.push(remainingRecords);
      }
    });

    this._messageBus.on('sendProfilerChunk', (chunkOfRecords: ProfilerFrame) => {
      this.stream.next([chunkOfRecords]);
      this._buffer.push(chunkOfRecords);
    });

    this._fileUploadSubscription = this._fileApiService.uploadedData.subscribe((importedFile) => {
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
            status: 'INVALID_VERSION'
          },
        });

        processDataDialog.afterClosed().subscribe((result) => {
          if (result) {
            this.state = 'visualizing';
            this._buffer = importedFile.buffer;
            setTimeout(() => this.stream.next(importedFile.buffer));
          }
        });
      } else {
        this.state = 'visualizing';
        this._buffer = importedFile.buffer;
        setTimeout(() => this.stream.next(importedFile.buffer));
      }
    });
  }

  ngOnDestroy(): void {
    this._fileUploadSubscription.unsubscribe();
  }

  exportProfilerResults(): void {
    const fileToExport = {
      version: PROFILER_VERSION,
      buffer: this._buffer,
    };
    this._fileApiService.saveObjectAsJSON(fileToExport);
  }

  importProfilerResults(event: InputEvent): void {
    this._fileApiService.publishFileUpload(event);
  }

  discardRecording(): void {
    this.stream = new Subject<ProfilerFrame[]>();
    this.state = 'idle';
    this._buffer = [];
  }
}
