import { Component, ViewChild, ElementRef } from '@angular/core';
import { IFrameMessageBus } from '../../iframe-message-bus';
import { PriorityAwareMessageBus, MessageBus, Events } from 'protocol';

@Component({
  templateUrl: './devtools-app.component.html',
  styleUrls: ['./devtools-app.component.scss'],
  providers: [
    {
      provide: MessageBus,
      useFactory(): MessageBus<Events> {
        return new PriorityAwareMessageBus(
          new IFrameMessageBus(
            'angular-devtools',
            'angular-devtools-backend',
            // tslint:disable-next-line: no-non-null-assertion
            () => (document.querySelector('#sample-app') as HTMLIFrameElement).contentWindow!
          )
        );
      },
    },
  ],
})
export class DevToolsComponent {
  messageBus: IFrameMessageBus | null = null;
  @ViewChild('ref') iframe: ElementRef;
}
