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

  @ViewChildren(RecordingComponent) recordingRef: QueryList<RecordingComponent>;

  startRecording() {
    this.state = 'recording';
    this.recordingRef.forEach(r => r.start());
    this.messageBus.emit('startProfiling');
  }

  stopRecording() {
    this.state = 'idle';
    this.recordingRef.forEach(r => r.stop());
    this.messageBus.emit('stopProfiling');
  }

  ngOnInit() {
    this.messageBus.on('profilerResults', results => {
      this.state = 'visualizing';
      this.visualState = 'aggregated';
      this.stream = results;
    });
  }

  discardRecording() {
    this.stream = [];
    this.state = 'idle';
    this.visualState = 'aggregated';
  }
}
