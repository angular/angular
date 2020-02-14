import { Component, Input, ViewChildren, QueryList, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RecordingComponent } from './recording/recording.component';
import { MessageBus, Events, AppRecord } from 'protocol';

type State = 'idle' | 'recording' | 'visualizing';
type VisualState = 'time-travel' | 'timeline' | 'aggregated';

@Component({
  selector: 'ng-profiler',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfilerComponent implements OnInit {
  @Input() messageBus: MessageBus<Events>;

  state: State = 'idle';
  visualState: VisualState = 'aggregated';
  stream: AppRecord[] = [];
  buffer: AppRecord[][] = [];

  @ViewChildren(RecordingComponent) recordingRef: QueryList<RecordingComponent>;

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
    this.messageBus.on('sendProfilerChunk', (chunkOfRecords: AppRecord[]) => {
      this.buffer.push(chunkOfRecords);
    });
  }

  private _profilerFinished(remainingRecords: AppRecord[]): void {
    this.state = 'visualizing';
    this.visualState = 'aggregated';

    const flattenedBuffer = [].concat.apply([], this.buffer);
    this.stream = [...flattenedBuffer, ...remainingRecords];
    this.buffer = [];
  }

  discardRecording(): void {
    this.stream = [];
    this.state = 'idle';
    this.visualState = 'aggregated';
  }
}
