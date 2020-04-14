import { initializeMessageBus } from 'ng-devtools-backend';
import { SamePageMessageBus } from './same-page-message-bus';
import { initializeExtendedWindowOperations } from './chrome-window-extensions';
import { unHighlight } from '../../../ng-devtools-backend/src/lib/highlighter';
import { runOutsideAngular } from '../../../ng-devtools-backend/src/lib/utils';

const messageBus = new SamePageMessageBus('angular-devtools-backend', 'angular-devtools-content-script');

let initialized = false;
messageBus.on('handshake', () => {
  console.log('Received init');
  if (initialized) {
    return;
  }
  initialized = true;
  initializeMessageBus(messageBus);
  initializeExtendedWindowOperations();

  let inspectorRunning = false;
  messageBus.on('inspectorStart', () => {
    inspectorRunning = true;
  });

  messageBus.on('inspectorEnd', () => {
    inspectorRunning = false;
  });

  // handles case when mouse leaves chrome extension too quickly. unHighlight() is not a very expensive function
  // and has an if check so it's DOM api call is not called more than necessary
  runOutsideAngular(() => {
    document.addEventListener(
      'mousemove',
      () => {
        if (!inspectorRunning) {
          unHighlight();
        }
      },
      false
    );
  });
});
