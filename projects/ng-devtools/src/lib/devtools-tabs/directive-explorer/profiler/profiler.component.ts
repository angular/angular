import { Component, Input, ViewChildren, QueryList, OnInit, OnDestroy } from '@angular/core';
import { RecordingComponent } from './recording/recording.component';
import { MessageBus, Events, ProfilerFrame } from 'protocol';
import { FileApiService } from '../../../file-api-service';

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
    this._fileApiService.uploadedData.subscribe(importedStream => {
      this._viewProfilerData(importedStream);
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
    this._fileApiService.saveObjectAsJSON(this.stream);
  }

  importProfilerResults(event): void {
    this._fileApiService.publishFileUpload(event);
  }

  discardRecording(): void {
    this.stream = [];
    this.state = 'idle';
  }
}
