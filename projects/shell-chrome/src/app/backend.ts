import { initializeMessageBus } from 'ng-devtools-backend';
import { SamePageMessageBus } from './same-page-message-bus';
import { initializeExtendedWindowOperations } from './chrome-window-extensions';


const messageBus = new SamePageMessageBus('angular-devtools-backend', 'angular-devtools-content-script');

let initialized = false;
messageBus.on('handshake', () => {
  console.log('Received init');
  messageBus.emit('syn');
  if (initialized) {
    return;
  }
  initialized = true;
  initializeMessageBus(messageBus);
  initializeExtendedWindowOperations();
});
