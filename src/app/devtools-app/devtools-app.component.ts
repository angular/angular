import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { IFrameMessageBus } from 'src/iframe-message-bus';

@Component({
  templateUrl: './devtools-app.component.html',
  styleUrls: ['./devtools-app.component.css'],
})
export class DevToolsComponent implements AfterViewInit {
  messageBus: IFrameMessageBus | null = null;
  @ViewChild('ref') iframe: ElementRef;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.messageBus = new IFrameMessageBus(
        'angular-devtools',
        'angular-devtools-backend',
        (document.querySelector('#sample-app') as HTMLIFrameElement).contentWindow
      ) as any;
    });
  }
}
