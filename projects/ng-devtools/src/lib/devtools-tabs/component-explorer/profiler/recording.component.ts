import { Component } from '@angular/core';

@Component({
  selector: 'ng-recording-modal',
  template: `
    <section *ngIf="visible" id="recorder-wrapper">
      <ng-recording-dialog></ng-recording-dialog>
    </section>
  `,
  styleUrls: ['./recording.component.css'],
})
export class RecordingComponent {
  visible = false;

  stop() {
    this.visible = false;
  }

  start() {
    this.visible = true;
  }
}

@Component({
  selector: 'ng-recording-dialog',
  template: `
    <section class="main-wrapper">
      <h2>Recording</h2>

      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    </section>
  `,
  styles: [
    `
      .main-wrapper {
        width: 300px;
        height: 100px;
        background-color: #ffffff;
        box-shadow: 0 0 7px #444;
        padding: 15px;
        margin-top: 45px;
      }

      h2 {
        text-align: center;
        color: #444;
        font-weight: 200;
        margin-top: 25px;
      }

      mat-progress-bar {
        top: 7px;
      }
    `,
  ],
})
export class RecordingDialogComponent {}
