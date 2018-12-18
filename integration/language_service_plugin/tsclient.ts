import { ChildProcess } from "child_process";
import { EventEmitter } from "events";

/**
 * Provides a client for tsserver. Tsserver does not use standard JSON-RPC
 * protocol thus the need for this custom client.
 */
export class Client {
  private data: Buffer|undefined;
  private id = 0;
  private responseEmitter = new EventEmitter();

  constructor(private readonly server: ChildProcess) {}

  listen() {
    this.server.stdout.on('data', (data: Buffer) => {
      this.data = this.data ? Buffer.concat([this.data, data]) : data;
      const CONTENT_LENGTH = 'Content-Length: '
      const index = this.data.indexOf(CONTENT_LENGTH);
      if (index < 0) {
        return;
      }
      let start = index + CONTENT_LENGTH.length;
      let end = this.data.indexOf('\r\n', start);
      if (end < start) {
        return;
      }
      const contentLengthStr = this.data.slice(start, end).toString();
      const contentLength = Number(contentLengthStr);
      if (isNaN(contentLength) || contentLength < 0) {
        return;
      }
      start = end + 4;
      end = start + contentLength;
      if (end > this.data.length) {
        return;
      }
      const content = this.data.slice(start, end).toString();
      this.data = this.data.slice(end);
      try {
        const payload = JSON.parse(content);
        if (payload.type === "event") {
          return;
        }
        this.responseEmitter.emit('response', payload);
      }
      catch (error) {
        this.responseEmitter.emit('error', error);
      }
    });
  }

  async send(type: string, command: string, params: {}) {
    const request = {
      seq: this.id++,
      type,
      command,
      arguments: params
    };
    this.server.stdin.write(JSON.stringify(request) + '\r\n');
    return new Promise((resolve, reject) => {
      this.responseEmitter.once('response', resolve);
      this.responseEmitter.once('error', reject);
    });
  }

  async sendRequest(command: string, params: {}) {
    return this.send('request', command, params);
  }
}
