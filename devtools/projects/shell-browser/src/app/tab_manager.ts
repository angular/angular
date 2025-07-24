/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="chrome"/>

import {Events, Topic} from '../../../protocol';

export interface ContentScriptConnection {
  port: chrome.runtime.Port | null;
  enabled: boolean;
  frameId: 'devtools' | number;
  backendReady?: Promise<void>;
}

export interface DevToolsConnection {
  devtools: chrome.runtime.Port | null;
  contentScripts: {[name: string]: ContentScriptConnection};
}

function isNumeric(str: string): boolean {
  return +str + '' === str;
}

export interface Tabs {
  [tabId: string]: DevToolsConnection | undefined;
}

export class TabManager {
  constructor(
    private tabs: Tabs,
    private runtime: typeof chrome.runtime,
  ) {}

  static initialize(tabs: Tabs, runtime: typeof chrome.runtime = chrome.runtime): TabManager {
    const manager = new TabManager(tabs, runtime);
    manager.initialize();
    return manager;
  }

  private initialize(): void {
    this.runtime.onConnect.addListener((port) => {
      if (isNumeric(port.name)) {
        this.registerDevToolsForTab(port);
        return;
      }

      if (
        !port.sender ||
        !port.sender.tab ||
        port.sender.tab.id === undefined ||
        port.sender.frameId === undefined
      ) {
        console.warn('Received a connection from an unknown sender', port);
        return;
      }

      this.registerContentScriptForTab(port);
    });
  }

  private ensureTabExists(tabId: number): void {
    this.tabs[tabId] ??= {
      devtools: null,
      contentScripts: {},
    };
  }

  private registerDevToolsForTab(port: chrome.runtime.Port): void {
    // For the devtools page, our port name is the tab id.
    const tabId = parseInt(port.name, 10);

    this.ensureTabExists(tabId);
    const tab = this.tabs[tabId]!;

    tab.devtools = port;
    tab.devtools.onDisconnect.addListener(() => {
      tab.devtools = null;

      for (const connection of Object.values(tab.contentScripts)) {
        connection.enabled = false;
      }
    });

    // DevTools may register after the content script has already registered. If that's the case,
    // we need to set up the double pipe between the devtools and each content script, and send
    // the contentScriptConnected message to the devtools page to inform it of all frames on the page.
    for (const [frameId, connection] of Object.entries(tab.contentScripts)) {
      connection.backendReady!.then(() => {
        if (connection.port === null) {
          throw new Error(
            'Expected Content to have already connected before the backendReady event on the same page.',
          );
        }
        this.doublePipe(tab.devtools, connection);
        tab.devtools!.postMessage({
          topic: 'contentScriptConnected',
          args: [parseInt(frameId, 10), connection.port.name, connection.port.sender!.url],
        });
      });
    }
  }

  private registerContentScriptForTab(port: chrome.runtime.Port): void {
    // A content script connection will have a sender and a tab id.
    const sender = port.sender!;
    const frameId = sender.frameId!;
    const tabId = sender.tab!.id!;

    this.ensureTabExists(tabId);
    const tab = this.tabs[tabId]!;

    if (tab.contentScripts[frameId] === undefined) {
      tab.contentScripts[frameId] = {
        port: null,
        enabled: false,
        frameId: -1,
      };
    }

    const contentScript = tab.contentScripts[frameId]!;
    contentScript.port = port;
    contentScript.frameId = frameId;
    contentScript.enabled = contentScript.enabled ?? false;

    // When the content script disconnects, clean up the connection state we're storing in the
    // background page.
    port.onDisconnect.addListener(() => {
      delete tab.contentScripts[frameId];

      if (Object.keys(tab.contentScripts).length === 0) {
        delete this.tabs[tabId];
      }
    });

    contentScript.backendReady = new Promise((resolveBackendReady) => {
      const onBackendReady = (message: {topic: string}) => {
        if (message.topic === 'backendReady') {
          // If DevTools is not yet connected, this resolve will enable devtools to eventually connect to this
          // content script (even though the content script connected first)
          resolveBackendReady();

          // If the devtools connection is already established, set up the double pipe between the
          // devtools and the content script.
          if (tab.devtools) {
            this.doublePipe(tab.devtools, contentScript);

            tab.devtools.postMessage({
              topic: 'contentScriptConnected',
              args: [frameId, contentScript.port!.name, contentScript.port!.sender!.url],
            });
          }

          port.onMessage.removeListener(onBackendReady);
        }
      };

      port.onMessage.addListener(onBackendReady);
      port.onDisconnect.addListener(() => {
        port.onMessage.removeListener(onBackendReady);
      });
    });
  }

  private doublePipe(
    devtoolsPort: chrome.runtime.Port | null,
    contentScriptConnection: ContentScriptConnection,
  ): void {
    if (devtoolsPort === null) {
      throw new Error('DevTools port is equal to null');
    }

    const contentScriptPort = contentScriptConnection.port;

    if (contentScriptPort === null) {
      throw new Error('Content script port is equal to null');
    }

    // tslint:disable-next-line:no-console
    console.log('Creating two-way communication channel', Date.now(), this.tabs);

    const onDevToolsMessage = (message: {topic: Topic; args: Parameters<Events[Topic]>}) => {
      if (message.topic === 'enableFrameConnection') {
        if (message.args.length !== 2) {
          throw new Error('Expected two arguments for enableFrameConnection');
        }

        const [frameId, tabId] = message.args as [frameId: number, tabId: number];

        if (frameId === contentScriptConnection.frameId) {
          const tab = this.tabs[tabId];

          if (tab === undefined) {
            throw new Error(`Expected tab to be registered with tabId ${tabId}`);
          }

          for (const frameId of Object.keys(tab.contentScripts)) {
            tab.contentScripts[frameId].enabled = false;
          }

          contentScriptConnection.enabled = true;
          devtoolsPort.postMessage({
            topic: 'frameConnected',
            args: [contentScriptConnection.frameId],
          });
        }
      }

      // Do not allow any message to be sent if a content script is not enabled. This is the
      // mechanism that lets us select which content script connection Angular Devtools is connected
      // to.
      if (!contentScriptConnection.enabled) {
        return;
      }

      contentScriptPort.postMessage(message);
    };
    devtoolsPort.onMessage.addListener(onDevToolsMessage);

    const onContentScriptMessage = (message: {topic: Topic; args: Parameters<Events[Topic]>}) => {
      // Do not allow any message to be sent if a content script is not enabled. This is the
      // mechanism that lets us select which content script connection Angular Devtools is connected
      // to.
      if (!contentScriptConnection.enabled) {
        return;
      }

      devtoolsPort.postMessage(message);
    };
    contentScriptPort.onMessage.addListener(onContentScriptMessage);

    const shutdownContentScript = () => {
      devtoolsPort.onMessage.removeListener(onDevToolsMessage);
      devtoolsPort.postMessage({
        topic: 'contentScriptDisconnected',
        args: [contentScriptConnection.frameId, contentScriptConnection.port!.name],
      });

      contentScriptPort.onMessage.removeListener(onContentScriptMessage);
    };
    contentScriptPort.onDisconnect.addListener(() => shutdownContentScript());
  }
}
