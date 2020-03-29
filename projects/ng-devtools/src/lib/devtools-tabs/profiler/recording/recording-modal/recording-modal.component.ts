import { Component } from '@angular/core';

@Component({
  selector: 'ng-recording-modal',
  templateUrl: './recording-modal.component.html',
  styleUrls: ['./recording-modal.component.scss'],
})
export class RecordingModalComponent {
  visible = false;

  stop(): void {
    this.visible = false;
  }

  start(): void {
    this.visible = true;
  }
}
