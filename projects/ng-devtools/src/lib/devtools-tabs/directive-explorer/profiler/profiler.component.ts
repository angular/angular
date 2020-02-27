import { Component, Input, ViewChildren, QueryList, OnInit, OnDestroy } from '@angular/core';
import { RecordingComponent } from './recording/recording.component';
import { MessageBus, Events, ProfilerFrame } from 'protocol';
import { FileApiService } from '../../../file-api-service';
import { version } from '../../../../../../../package.json';

type State = 'idle' | 'recording' | 'visualizing';

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

  @ViewChildren(RecordingComponent) recordingRef: QueryList<RecordingComponent>;

  constructor(private _fileApiService: FileApiService) {}

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
      } else {
        let processData = true;
        if (importedFile.version !== version) {
          processData = confirm(
            `The file you are attempting to upload was recorded in a different version of Angular Devtools than the version you are using. \nCurrent Angular Devtools version: ${version}. \nVersion of the file you are uploading: ${importedFile.version}. \nFiles recorded in older versions may no longer be compatible. Do you wish to continue?`
          );
        }
        if (processData) {
          this._viewProfilerData(importedFile.stream);
        }
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

  private _viewProfilerData(stream): void {
    this.state = 'visualizing';
    this.stream = stream;
  }

  exportProfilerResults(): void {
    const fileToExport = {
      version,
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
