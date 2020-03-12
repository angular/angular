import { initializeMessageBus } from 'ng-devtools-backend';
import { SamePageMessageBus } from './same-page-message-bus';
import { initializeExtendedWindowOperations } from './chrome-window-extensions';
import { initializeRefreshSubscriber } from './refresh-handler';

const messageBus = new SamePageMessageBus('angular-devtools-backend', 'angular-devtools-content-script');
initializeRefreshSubscriber(messageBus);

let initialized = false;
messageBus.on('handshake', () => {
  console.log('Received init');
  if (initialized) {
    return;
  }
  initialized = true;
  initializeMessageBus(messageBus);
  initializeExtendedWindowOperations();
});
