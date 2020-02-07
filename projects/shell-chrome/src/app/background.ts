const ports: {
  [tab: string]: {
    'content-script': chrome.runtime.Port;
    devtools: chrome.runtime.Port;
  };
} = {};

chrome.runtime.onConnect.addListener(port => {
  let tab = null;
  let name = null;
  console.log('Connection event in the background script');
  if (isNumeric(port.name)) {
    tab = port.name;
    console.log('Angular devtools connected, injecting the content script', port.name, ports[tab]);
    name = 'devtools';
    installContentScript(+port.name);
  } else {
    console.log('Content script connected', port.sender.tab.id);
    tab = port.sender.tab.id;
    name = 'content-script';
  }

  if (!ports[tab]) {
    console.log('Creating a tab port');
    ports[tab] = {
      devtools: null,
      'content-script': null,
    };
  }

  ports[tab][name] = port;

  if (ports[tab].devtools && ports[tab]['content-script']) {
    doublePipe(ports[tab].devtools, ports[tab]['content-script'], tab);
  }
});

const isNumeric = (str: string): boolean => {
  return +str + '' === str;
};

const installContentScript = (tabId: number) => {
  console.log('Installing the content-script');
  chrome.tabs.executeScript(tabId, { file: '/content-script.js' }, () => {});
  chrome.tabs.executeScript(tabId, { file: '/runtime.js' }, () => {});
};

const doublePipe = (devtoolsPort: chrome.runtime.Port, contentScriptPort: chrome.runtime.Port, tab: string) => {
  console.log('Creating two-way communication channel', Date.now(), ports);

  const onDevToolsMessage = (message: chrome.runtime.Port) => {
    contentScriptPort.postMessage(message);
  };
  devtoolsPort.onMessage.addListener(onDevToolsMessage);

  const onContentScriptMessage = (message: chrome.runtime.Port) => {
    devtoolsPort.postMessage(message);
  };
  contentScriptPort.onMessage.addListener(onContentScriptMessage);

  const shutdown = (source: string) => {
    console.log('Disconnecting', source);
    devtoolsPort.onMessage.removeListener(onDevToolsMessage);
    contentScriptPort.onMessage.removeListener(onContentScriptMessage);
    devtoolsPort.disconnect();
    contentScriptPort.disconnect();
    ports[tab] = undefined;
  };
  devtoolsPort.onDisconnect.addListener(shutdown.bind(null, 'devtools'));
  contentScriptPort.onDisconnect.addListener(shutdown.bind(null, 'content-script'));
};
