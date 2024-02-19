/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DevToolsConnection, TabManager, Tabs} from './tab_manager';

interface MockSender {
  url: string;
  tab: {
    id: number;
  };
  frameId: number;
}

const TEST_MESSAGE_ONE = {topic: 'test', args: ['test1']};
const TEST_MESSAGE_TWO = {topic: 'test', args: ['test2']};

class MockPort {
  onMessageListeners: Function[] = [];
  onDisconnectListeners: Function[] = [];
  messagesPosted: any[] = [];
  name: string;
  sender?: MockSender;

  constructor(
    public properties: {
      name: string;
      sender?: MockSender;
    },
  ) {
    this.name = properties.name;
    this.sender = properties.sender;
  }

  postMessage(message: any): void {
    this.messagesPosted.push(message);
  }

  onMessage = {
    addListener: (listener: Function): void => {
      this.onMessageListeners.push(listener);
    },
  };

  onDisconnect = {
    addListener: (listener: Function): void => {
      this.onDisconnectListeners.push(listener);
    },
  };
}

function assertArrayHasObj<T>(array: T[], obj: T) {
  expect(array).toContain(jasmine.objectContaining(obj as object));
}

function assertArrayDoesNotHaveObj<T extends object>(array: T[], obj: T) {
  expect(array).not.toContain(jasmine.objectContaining(obj));
}

function mockSpyFunction(obj: any, property: string, returnValue: any) {
  (obj[property] as any).and.returnValue(() => returnValue);
}

function mockSpyProperty(obj: any, property: string, value: any) {
  (Object.getOwnPropertyDescriptor(obj, property)!.get as any).and.returnValue(value);
}

describe('Tab Manager - ', () => {
  let tabs: Tabs;
  const tabId = 12345;
  let chromeRuntime: jasmine.SpyObj<typeof chrome.runtime>;
  let tabManager: TabManager;
  let tab: DevToolsConnection;
  let chromeRuntimeOnConnectListeners: ((port: MockPort) => void)[] = [];

  function connectToChromeRuntime(port: MockPort): void {
    for (const listener of chromeRuntimeOnConnectListeners) {
      listener(port);
    }
  }

  function emitMessageToPort(port: MockPort, message: any): void {
    for (const listener of port.onMessageListeners) {
      listener(message);
    }
  }

  function emitDisconnectToPort(port: MockPort) {
    for (const listener of port.onDisconnectListeners) {
      listener();
    }
  }

  function createDevToolsPort() {
    const port = new MockPort({
      name: tabId.toString(),
    });
    connectToChromeRuntime(port);
    return port;
  }

  beforeEach(() => {
    chromeRuntimeOnConnectListeners = [];
    chromeRuntime = jasmine.createSpyObj(
      'chrome.runtime',
      ['getManifest', 'getURL'],
      ['onConnect', 'onDisconnect'],
    );
    mockSpyFunction(chromeRuntime, 'getManifest', {manifest_version: 3});
    mockSpyFunction(chromeRuntime, 'getURL', (path: string) => path);
    mockSpyProperty(chromeRuntime, 'onConnect', {
      addListener: (listener: (port: MockPort) => void) => {
        chromeRuntimeOnConnectListeners.push(listener);
      },
    });
  });

  describe('Single Frame', () => {
    const testURL = 'http://example.com';
    const contentScriptFrameId = 0;
    // let contentPort: MockPort;

    function createContentScriptPort() {
      const port = new MockPort({
        name: 'Content Script',
        sender: {
          url: testURL,
          tab: {
            id: tabId,
          },
          frameId: contentScriptFrameId,
        },
      });
      connectToChromeRuntime(port);
      emitMessageToPort(port, {topic: 'backendReady'});
      return port;
    }

    beforeEach(() => {
      tabs = {};
      tabManager = TabManager.initialize(tabs, chromeRuntime);
    });

    it('should setup tab object in the tab manager', () => {
      const contentScriptPort = createContentScriptPort();
      const devtoolsPort = createDevToolsPort();
      tab = tabs[tabId]!;

      expect(tab).toBeDefined();
      expect(tab!.devtools).toBe(devtoolsPort as unknown as chrome.runtime.Port);
      expect(tab!.contentScripts[contentScriptFrameId].port).toBe(
        contentScriptPort as unknown as chrome.runtime.Port,
      );
    });

    it('should set frame connection as enabled when an enableFrameConnection message is recieved', () => {
      const contentScriptPort = createContentScriptPort();
      const devtoolsPort = createDevToolsPort();
      tab = tabs[tabId]!;

      // Test backendReady and contentScriptConnected messages.
      expect(tab?.contentScripts[contentScriptFrameId]?.enabled).toBe(false);
      emitMessageToPort(devtoolsPort, {
        topic: 'enableFrameConnection',
        args: [contentScriptFrameId, tabId],
      });

      expect(tab?.contentScripts[contentScriptFrameId]?.enabled).toBe(true);
      assertArrayHasObj(devtoolsPort.messagesPosted, {
        topic: 'frameConnected',
        args: [contentScriptFrameId],
      });
    });

    it('should pipe messages from the content script and devtools script to each other when the content script frame is enabled', () => {
      const contentScriptPort = createContentScriptPort();
      const devtoolsPort = createDevToolsPort();

      emitMessageToPort(devtoolsPort, {
        topic: 'enableFrameConnection',
        args: [contentScriptFrameId, tabId],
      });

      // Verify that the double pipe is set up between the content script and the devtools page.
      emitMessageToPort(contentScriptPort, TEST_MESSAGE_ONE);
      assertArrayHasObj(devtoolsPort.messagesPosted, TEST_MESSAGE_ONE);
      assertArrayDoesNotHaveObj(contentScriptPort.messagesPosted, TEST_MESSAGE_ONE);

      emitMessageToPort(devtoolsPort, TEST_MESSAGE_TWO);
      assertArrayHasObj(contentScriptPort.messagesPosted, TEST_MESSAGE_TWO);
      assertArrayDoesNotHaveObj(devtoolsPort.messagesPosted, TEST_MESSAGE_TWO);
    });

    it('should not pipe messages from the content script and devtools script to each other when the content script frame is disabled', () => {
      const contentScriptPort = createContentScriptPort();
      const devtoolsPort = createDevToolsPort();
      tab = tabs[tabId]!;

      expect(tab?.contentScripts[contentScriptFrameId]?.enabled).toBe(false);

      emitMessageToPort(contentScriptPort, TEST_MESSAGE_ONE);
      assertArrayDoesNotHaveObj(contentScriptPort.messagesPosted, TEST_MESSAGE_ONE);

      emitMessageToPort(devtoolsPort, TEST_MESSAGE_TWO);
      assertArrayDoesNotHaveObj(devtoolsPort.messagesPosted, TEST_MESSAGE_TWO);
    });

    it('should set backendReady when the contentPort recieves the backendReady message', () => {
      const contentScriptPort = createContentScriptPort();
      const devtoolsPort = createDevToolsPort();
      tab = tabs[tabId]!;

      emitMessageToPort(devtoolsPort, {
        topic: 'enableFrameConnection',
        args: [contentScriptFrameId, tabId],
      });

      expect(tab?.contentScripts[contentScriptFrameId]?.backendReady).toBe(true);
      assertArrayHasObj(devtoolsPort.messagesPosted, {
        topic: 'contentScriptConnected',
        args: [contentScriptFrameId, contentScriptPort.name, contentScriptPort.sender!.url],
      });
    });

    it('should set tab.devtools to null when the devtoolsPort disconnects', () => {
      const contentScriptPort = createContentScriptPort();
      const devtoolsPort = createDevToolsPort();
      tab = tabs[tabId]!;

      emitMessageToPort(devtoolsPort, {
        topic: 'enableFrameConnection',
        args: [contentScriptFrameId, tabId],
      });
      expect(tab?.contentScripts[contentScriptFrameId]?.enabled).toBe(true);

      emitDisconnectToPort(devtoolsPort);
      expect(tab.devtools).toBeNull();
      expect(tab?.contentScripts[contentScriptFrameId]?.enabled).toBe(false);
    });
  });

  describe('Multiple Frames', () => {
    const topLevelFrameId = 0;
    const childFrameId = 1;

    function createTopLevelContentScriptPort() {
      const port = new MockPort({
        name: 'Top level content script',
        sender: {
          url: 'TEST_URL',
          tab: {
            id: tabId,
          },
          frameId: topLevelFrameId,
        },
      });
      connectToChromeRuntime(port);
      return port;
    }
    function createChildContentScriptPort() {
      const port = new MockPort({
        name: 'Child content script',
        sender: {
          url: 'TEST_URL_2',
          tab: {
            id: tabId,
          },
          frameId: childFrameId,
        },
      });
      connectToChromeRuntime(port);
      return port;
    }

    beforeEach(() => {
      tabs = {};
      tabManager = TabManager.initialize(tabs, chromeRuntime);
    });

    it('should setup tab object in the tab manager', () => {
      const devtoolsPort = createDevToolsPort();
      const topLevelContentScriptPort = createTopLevelContentScriptPort();
      const childContentScriptPort = createChildContentScriptPort();

      tab = tabs[tabId]!;

      expect(tab).toBeDefined();
      expect(tab!.devtools).toBe(devtoolsPort as unknown as chrome.runtime.Port);
      expect(tab!.contentScripts[topLevelFrameId].port).toBe(
        topLevelContentScriptPort as unknown as chrome.runtime.Port,
      );
      expect(tab!.contentScripts[childFrameId].port).toBe(
        childContentScriptPort as unknown as chrome.runtime.Port,
      );
    });

    it('should setup message and disconnect listeners on devtools and content script ports', () => {
      const devtoolsPort = createDevToolsPort();
      const topLevelContentScriptPort = createTopLevelContentScriptPort();
      const childContentScriptPort = createChildContentScriptPort();

      // 1 listener to clean up tab object if this was the last content script connection.
      // 1 listener to cleanup the douple pipe between the content script and the devtools page.
      expect(topLevelContentScriptPort.onDisconnectListeners.length).toBe(2);
      expect(childContentScriptPort.onDisconnectListeners.length).toBe(2);

      // 1 listener to clean up devtools connection
      expect(devtoolsPort.onDisconnectListeners.length).toBe(1);

      // 1 listener set when the content script is registered to check for backendReady.
      // 1 listener set when the double pipe is set up between the content script and the devtools page.
      expect(topLevelContentScriptPort.onMessageListeners.length).toBe(2);
      expect(childContentScriptPort.onMessageListeners.length).toBe(2);
    });

    it('should set the correct frame connection as enabled when an enableFrameConnection message is recieved', () => {
      const devtoolsPort = createDevToolsPort();
      createTopLevelContentScriptPort();
      createChildContentScriptPort();
      tab = tabs[tabId]!;

      expect(tab?.contentScripts[topLevelFrameId]?.enabled).toBe(false);
      expect(tab?.contentScripts[childFrameId]?.enabled).toBe(false);
      emitMessageToPort(devtoolsPort, {
        topic: 'enableFrameConnection',
        args: [topLevelFrameId, tabId],
      });
      expect(tab?.contentScripts[topLevelFrameId]?.enabled).toBe(true);
      expect(tab?.contentScripts[childFrameId]?.enabled).toBe(false);
      assertArrayHasObj(devtoolsPort.messagesPosted, {
        topic: 'frameConnected',
        args: [topLevelFrameId],
      });
      assertArrayDoesNotHaveObj(devtoolsPort.messagesPosted, {
        topic: 'frameConnected',
        args: [childFrameId],
      });
    });

    it('should pipe messages from the correct content script and devtools script when that content script frame is enabled', () => {
      const devtoolsPort = createDevToolsPort();
      const topLevelContentScriptPort = createTopLevelContentScriptPort();
      const childContentScriptPort = createChildContentScriptPort();

      emitMessageToPort(devtoolsPort, {
        topic: 'enableFrameConnection',
        args: [topLevelFrameId, tabId],
      });
      emitMessageToPort(devtoolsPort, TEST_MESSAGE_ONE);
      assertArrayHasObj(topLevelContentScriptPort.messagesPosted, TEST_MESSAGE_ONE);
      assertArrayDoesNotHaveObj(childContentScriptPort.messagesPosted, TEST_MESSAGE_ONE);

      emitMessageToPort(devtoolsPort, {
        topic: 'enableFrameConnection',
        args: [childFrameId, tabId],
      });
      emitMessageToPort(devtoolsPort, TEST_MESSAGE_TWO);
      assertArrayHasObj(childContentScriptPort.messagesPosted, TEST_MESSAGE_TWO);
      assertArrayDoesNotHaveObj(topLevelContentScriptPort.messagesPosted, TEST_MESSAGE_TWO);
    });
  });
});
