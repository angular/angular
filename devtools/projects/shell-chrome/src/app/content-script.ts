import {ChromeMessageBus} from './chrome-message-bus';
import {SamePageMessageBus} from './same-page-message-bus';

export const main = () => {
  let backgroundDisconnected = false;
  let backendInitialized = false;

  // console.log('Content script executing', (window as any));

  const port = chrome.runtime.connect({
    name: 'content-script',
  });

  const handleDisconnect = (): void => {
    // console.log('Background disconnected', new Date());
    localMessageBus.emit('shutdown');
    localMessageBus.destroy();
    chromeMessageBus.destroy();
    backgroundDisconnected = true;
  };

  port.onDisconnect.addListener(handleDisconnect);

  const localMessageBus =
      new SamePageMessageBus('angular-devtools-content-script', 'angular-devtools-backend');
  const chromeMessageBus = new ChromeMessageBus(port);

  const handshakeWithBackend = (): void => {
    localMessageBus.emit('handshake');
  };

  chromeMessageBus.onAny((topic, args) => {
    localMessageBus.emit(topic, args);
  });

  localMessageBus.onAny((topic, args) => {
    backendInitialized = true;
    chromeMessageBus.emit(topic, args);
  });

  if (!backendInitialized) {
    console.log('Attempting initialization', new Date());
    const retry = () => {
      if (backendInitialized || backgroundDisconnected) {
        return;
      }
      handshakeWithBackend();
      setTimeout(retry, 500);
    };
    retry();
  }
};
