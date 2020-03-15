import { Component, Input, ViewChildren, QueryList, OnInit, OnDestroy } from '@angular/core';
import { RecordingModalComponent } from './recording/recording-modal/recording-modal.component';
import { MessageBus, Events, ProfilerFrame } from 'protocol';
import { FileApiService } from '../../../file-api-service';
import { MatDialog } from '@angular/material/dialog';
import { ProfilerImportDialogComponent } from './profiler-import-dialog/profiler-import-dialog.component';

type State = 'idle' | 'recording' | 'visualizing';

const SUPPORTED_VERSIONS = [1];
const PROFILER_VERSION = 1;

@Component({
  selector: 'ng-profiler',
  templateUrl: './profiler.component.html',
  styleUrls: ['./profiler.component.css'],
})
export class ProfilerComponent implements OnInit, OnDestroy {
  @Input() messageBus: MessageBus<Events>;

  state: State = 'idle';
  stream: ProfilerFrame[] = [];
  buffer: ProfilerFrame[] = [];

  @ViewChildren(RecordingModalComponent) recordingRef: QueryList<RecordingModalComponent>;

  constructor(private _fileApiService: FileApiService, public dialog: MatDialog) {}

  startRecording(): void {
    this.state = 'recording';
    this.recordingRef.forEach(r => r.start());
    this.messageBus.emit('startProfiling');
  }

  stopRecording(): void {
    this.state = 'idle';
    this.recordingRef.forEach(r => r.stop());
    this.messageBus.emit('stopProfiling');
  }

  ngOnInit(): void {
    this.messageBus.on('profilerResults', remainingRecords => {
      this._profilerFinished(remainingRecords);
    });

    this.messageBus.on('sendProfilerChunk', (chunkOfRecords: ProfilerFrame) => {
      this.buffer.push(chunkOfRecords);
    });

    this._fileApiService.uploadedData.subscribe(importedFile => {
      if (importedFile.error) {
        console.error('Could not process uploaded file');
        console.error(importedFile.error);
        this.dialog.open(ProfilerImportDialogComponent, {
          width: '600px',
          data: { status: 'ERROR', errorMessage: importedFile.error },
        });

        return;
      }

      if (!SUPPORTED_VERSIONS.includes(importedFile.version)) {
        const processDataDialog = this.dialog.open(ProfilerImportDialogComponent, {
          width: '600px',
          data: { importedVersion: importedFile.version, profilerVersion: PROFILER_VERSION, status: 'INVALID_VERSION' },
        });

        processDataDialog.afterClosed().subscribe(result => {
          if (result) {
            this._viewProfilerData(importedFile.stream);
          }
        });
      } else {
        this._viewProfilerData(importedFile.stream);
      }
    });
  }

  private _profilerFinished(remainingRecords: ProfilerFrame): void {
    const flattenedBuffer = [].concat.apply([], this.buffer);
    this._viewProfilerData([...flattenedBuffer, remainingRecords]);
    this.buffer = [];
  }

  ngOnDestroy(): void {
    this._fileApiService.uploadedData.unsubscribe();
  }

  private _viewProfilerData(stream: ProfilerFrame[]): void {
    this.state = 'visualizing';
    this.stream = stream;
  }

  exportProfilerResults(): void {
    const fileToExport = {
      version: PROFILER_VERSION,
      stream: this.stream,
    };
    this._fileApiService.saveObjectAsJSON(fileToExport);
  }

  importProfilerResults(event: InputEvent): void {
    this._fileApiService.publishFileUpload(event);
  }

  discardRecording(): void {
    this.stream = [];
    this.state = 'idle';
  }
}
