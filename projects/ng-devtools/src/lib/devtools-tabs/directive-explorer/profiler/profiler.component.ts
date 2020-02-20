import { Component, Input, ViewChildren, QueryList, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RecordingComponent } from './recording/recording.component';
import { MessageBus, Events, ProfilerFrame } from 'protocol';

type State = 'idle' | 'recording' | 'visualizing';

@Component({
  selector: 'ng-profiler',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfilerComponent implements OnInit {
  @Input() messageBus: MessageBus<Events>;

  state: State = 'idle';
  stream: ProfilerFrame[] = [];
  buffer: ProfilerFrame[] = [];

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
    this.messageBus.on('sendProfilerChunk', (chunkOfRecords: ProfilerFrame) => {
      this.buffer.push(chunkOfRecords);
    });
  }

  private _profilerFinished(remainingRecords: ProfilerFrame): void {
    this.state = 'visualizing';

    const flattenedBuffer = [].concat.apply([], this.buffer);
    this.stream = [...flattenedBuffer, remainingRecords];
    this.buffer = [];
  }

  discardRecording(): void {
    this.stream = [];
    this.state = 'idle';
  }
}
