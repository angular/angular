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
    this.server.stdout!.on('data', (data: Buffer) => {
      this.data = this.data ? Buffer.concat([this.data, data]) : data;
      // tsserver could batch multiple responses together so we have to go
      // through the entire buffer to keep looking for messages.
      const CONTENT_LENGTH = 'Content-Length: '
      do {
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
          if (payload.type === "response") {
            const seq = `${payload.request_seq}`;
            this.responseEmitter.emit(seq, payload);
          }
        }
        catch (error) {
          this.responseEmitter.emit('error', error);
        }
      } while (this.data.length > 0)
    });
  }

  async send(type: string, command: string, params: {}) {
    const seq = this.id++;
    const request = {
      seq,
      type,
      command,
      arguments: params
    };
    this.server.stdin!.write(JSON.stringify(request) + '\r\n');
    return new Promise((resolve, reject) => {
      this.responseEmitter.once(`${seq}`, resolve);
      this.responseEmitter.once('error', reject);
    });
  }

  async sendRequest(command: string, params: {}) {
    return this.send('request', command, params);
  }
}
