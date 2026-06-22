/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject, signal} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatProgressBar} from '@angular/material/progress-bar';
import {ElementPosition, Events, MessageBus, ProfilerFrame} from '../../../../../protocol';
import {Subject} from 'rxjs';

import {FileApiService} from './file-api-service';
import {ProfilerImportDialogComponent} from './profiler-import-dialog/profiler-import-dialog.component';
import {RecordingTimelineComponent} from './recording-timeline/recording-timeline.component';
import {ButtonComponent} from '../../shared/button/button.component';

type State = 'idle' | 'recording' | 'visualizing';

const SUPPORTED_VERSIONS = [1];
const PROFILER_VERSION = 1;

@Component({
  selector: 'ng-profiler',
  templateUrl: './profiler.component.html',
  styleUrls: ['./profiler.component.scss'],
  imports: [MatTooltip, MatIcon, RecordingTimelineComponent, ButtonComponent, MatProgressBar],
})
export class ProfilerComponent {
  readonly state = signal<State>('idle');
  stream = new Subject<ProfilerFrame[]>();

  // We collect this buffer so we can have it available for export.
  private _buffer: ProfilerFrame[] = [];

  private _fileApiService = inject(FileApiService);
  private _messageBus = inject<MessageBus<Events>>(MessageBus);
  public dialog = inject(MatDialog);

  constructor() {
    this._fileApiService.uploadedData.subscribe((importedFile) => {
      if (importedFile.error) {
        console.error('Could not process uploaded file');
        console.error(importedFile.error);

        const errorMessage =
          importedFile.error instanceof Error
            ? `${importedFile.error.name}: ${importedFile.error.message}`
            : JSON.stringify(importedFile.error);

        this.dialog.open(ProfilerImportDialogComponent, {
          width: '600px',
          data: {status: 'ERROR', errorMessage},
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

    this._messageBus.on('sendProfilerChunk', (chunkOfRecords: ProfilerFrame) => {
      this.stream.next([chunkOfRecords]);
      this._buffer.push(chunkOfRecords);
      this._highlightRenderScanOverlay(chunkOfRecords);
    });
  }

  startRecording(): void {
    this._messageBus.emit('removeRenderScanOverlay');
    this.state.set('recording');
    this._messageBus.emit('startProfiling');
  }

  stopRecording(): void {
    this.state.set('visualizing');
    this._messageBus.emit('stopProfiling');
    this._messageBus.emit('removeRenderScanOverlay');
    this.stream.complete();
  }

  exportProfilerResults(): void {
    const fileToExport = {
      version: PROFILER_VERSION,
      buffer: this._buffer,
    };
    this._fileApiService.saveObjectAsJSON(fileToExport);
  }

  importProfilerResults(event: Event): void {
    this._fileApiService.publishFileUpload(event);
  }

  discardRecording(): void {
    this._messageBus.emit('removeRenderScanOverlay');
    this.stream = new Subject<ProfilerFrame[]>();
    this.state.set('idle');
    this._buffer = [];
  }

  private _highlightRenderScanOverlay(frame: ProfilerFrame): void {
    const positions = collectRenderScanPositions(frame.directives);
    if (!positions.length) {
      this._messageBus.emit('removeRenderScanOverlay');
      return;
    }

    this._messageBus.emit('createRenderScanOverlay', [positions]);
  }
}

function collectRenderScanPositions(
  elements: ProfilerFrame['directives'],
  path: ElementPosition = [],
  positions: ElementPosition[] = [],
): ElementPosition[] {
  elements.forEach((element, index) => {
    if (!element) {
      return;
    }

    const position = [...path, index];
    if (didRunChangeDetection(element)) {
      positions.push(position);
    }

    collectRenderScanPositions(element.children, position, positions);
  });

  return positions;
}

function didRunChangeDetection(profile: ProfilerFrame['directives'][number]): boolean {
  const components = profile.directives.filter((directive) => directive.isComponent);
  if (!components.length) {
    return false;
  }

  return components.some((component) => component.changeDetection !== undefined);
}
