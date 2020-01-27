import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { IFrameMessageBus } from 'src/iframe-message-bus';

@Component({
  template: `
    <iframe #ref src="demo-app/todos/app" id="sample-app"></iframe>
    <br>
    <div class="devtools-wrapper">
      <ng-devtools *ngIf="messageBus !== null" [messageBus]="messageBus"></ng-devtools>
    </div>
  `,
  styles: [`
  iframe {
    height: 440px;
    width: 100%;
    border: 0;
  }
  .devtools-wrapper {
    height: calc(100vh - 444px);
  }
  `]
})
export class DevToolsComponent implements AfterViewInit {
  messageBus: IFrameMessageBus | null = null;
  @ViewChild('ref') iframe: ElementRef;

  ngAfterViewInit() {
    setTimeout(() => {
      this.messageBus = new IFrameMessageBus(
        'angular-devtools',
        'angular-devtools-backend',
        (document.querySelector('#sample-app') as HTMLIFrameElement).contentWindow
      ) as any;
    });
  }
}
