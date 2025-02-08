/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createServer, Server, Socket} from 'net';

import {IPC_PORT} from '../ipc-defaults';
import {
  BackgroundServiceReceiveMessages,
  InternalErrorMessage,
  NoAvailableBrowserMessage,
} from '../ipc-messages';

import {SaucelabsDaemon} from './saucelabs-daemon';

let nextSocketId = 0;

/**
 * The IPC server for the Saucelabs background service. This server
 * listens on the port IPC_PORT for `start-test` and `end-test` messages
 * from karma tests. These messages are handled and requests are passed
 * forward to the service SaucelabsDaemon class.
 */
export class IpcServer {
  private readonly _server: Server;
  private _connections = new Map<number, Socket>();

  constructor(private _service: SaucelabsDaemon) {
    this._server = createServer(this._connectionHandler.bind(this));
    this._server.listen(IPC_PORT, () =>
      console.info(`Daemon IPC server listening (pid ${process.pid}).`),
    );
  }

  private _connectionHandler(socket: Socket) {
    const socketId = nextSocketId++;
    this._connections.set(socketId, socket);
    socket.on('data', (b) => {
      this._processMessage(
        socket,
        socketId,
        JSON.parse(b.toString()) as BackgroundServiceReceiveMessages,
      ).catch((err) => {
        console.error(err);
        this._sendInternalError(socket, err.toString());
      });
    });
  }

  private async _processMessage(
    socket: Socket,
    socketId: number,
    message: BackgroundServiceReceiveMessages,
  ) {
    switch (message.type) {
      case 'start-test':
        console.debug(`Requesting test browser: SID#${socketId}: ${message.testDescription}`);
        const started = await this._service.startTest({
          testId: socketId,
          pageUrl: message.url,
          requestedBrowserId: message.browserId,
        });
        if (!started) {
          console.debug('  > Browser not available.');
          this._sendUnavailableBrowserMessage(socket);
        } else {
          console.debug('  > Browser available. Test can start.');
        }
        break;
      case 'end-test':
        console.debug(`Ending tests for SID#${socketId}`);
        this._service.endTest(socketId);
        break;
      default:
        throw new Error(`Unsupported msg type: ${(message as any).type}`);
    }
  }

  private _sendUnavailableBrowserMessage(socket: Socket) {
    socket.write(JSON.stringify(new NoAvailableBrowserMessage()));
  }

  private _sendInternalError(socket: Socket, msg: string) {
    socket.write(JSON.stringify(new InternalErrorMessage(msg)));
  }
}
