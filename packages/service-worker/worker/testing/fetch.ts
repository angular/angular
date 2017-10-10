/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export class MockBody implements Body {
  bodyUsed: boolean = false;

  constructor(public _body: string|null) {}

  async arrayBuffer(): Promise<ArrayBuffer> {
    this.markBodyUsed();
    if (this._body !== null) {
      const buffer = new ArrayBuffer(this._body.length);
      const access = new Uint8Array(buffer);
      for (let i = 0; i < this._body.length; i++) {
        access[i] = this._body.charCodeAt(i);
      }
      return buffer;
    } else {
      throw new Error('No body');
    }
  }

  async blob(): Promise<Blob> { throw 'Not implemented'; }

  async json(): Promise<any> {
    this.markBodyUsed();
    if (this._body !== null) {
      return JSON.parse(this._body);
    } else {
      throw new Error('No body');
    }
  }

  async text(): Promise<string> {
    this.markBodyUsed();
    if (this._body !== null) {
      return this._body;
    } else {
      throw new Error('No body');
    }
  }

  async formData(): Promise<FormData> { throw 'Not implemented'; }

  private markBodyUsed(): void {
    if (this.bodyUsed === true) {
      throw new Error('Cannot reuse body without cloning.');
    }
    this.bodyUsed = true;
  }
}

export class MockHeaders implements Headers {
  map = new Map<string, string>();
  append(name: string, value: string): void { this.map.set(name, value); }

  delete (name: string): void { this.map.delete(name); }

  forEach(callback: Function): void { this.map.forEach(callback as any); }

  get(name: string): string|null { return this.map.get(name) || null; }

  has(name: string): boolean { return this.map.has(name); }

  set(name: string, value: string): void { this.map.set(name, value); }
}

export class MockRequest extends MockBody implements Request {
  readonly cache: RequestCache = 'default';
  readonly credentials: RequestCredentials = 'omit';
  readonly destination: RequestDestination = 'document';
  readonly headers: Headers = new MockHeaders();
  readonly integrity: string = '';
  readonly keepalive: boolean = true;
  readonly method: string = 'GET';
  readonly mode: RequestMode = 'cors';
  readonly redirect: RequestRedirect = 'error';
  readonly referrer: string = '';
  readonly referrerPolicy: ReferrerPolicy = 'no-referrer';
  readonly type: RequestType = '';
  url: string;

  constructor(input: string|Request, init: RequestInit = {}) {
    super(init !== undefined ? init.body || null : null);
    if (typeof input !== 'string') {
      throw 'Not implemented';
    }
    this.url = input;
    if (init.headers !== undefined) {
      if (init.headers instanceof MockHeaders) {
        this.headers = init.headers;
      } else {
        Object.keys(init.headers).forEach(header => {
          this.headers.set(header, init.headers[header]);
        });
      }
    }
    if (init.mode !== undefined) {
      this.mode = init.mode;
    }
    if (init.credentials !== undefined) {
      this.credentials = init.credentials;
    }
  }

  clone(): Request {
    if (this.bodyUsed) {
      throw 'Body already consumed';
    }
    return new MockRequest(
        this.url,
        {body: this._body, mode: this.mode, credentials: this.credentials, headers: this.headers});
  }
}

export class MockResponse extends MockBody implements Response {
  readonly headers: Headers = new MockHeaders();
  get ok(): boolean { return this.status >= 200 && this.status < 300; }
  readonly status: number;
  readonly statusText: string;
  readonly type: ResponseType = 'basic';
  readonly url: string = '';
  readonly body: ReadableStream|null = null;
  readonly redirected: boolean = false;

  constructor(
      body?: any,
      init: ResponseInit&{type?: ResponseType, redirected?: boolean, url?: string} = {}) {
    super(typeof body === 'string' ? body : null);
    this.status = (init.status !== undefined) ? init.status : 200;
    this.statusText = init.statusText || 'OK';
    if (init.headers !== undefined) {
      if (init.headers instanceof MockHeaders) {
        this.headers = init.headers;
      } else {
        Object.keys(init.headers).forEach(header => {
          this.headers.set(header, init.headers[header]);
        });
      }
    }
    if (init.type !== undefined) {
      this.type = init.type;
    }
    if (init.redirected !== undefined) {
      this.redirected = init.redirected;
    }
    if (init.url !== undefined) {
      this.url = init.url;
    }
  }

  clone(): Response {
    if (this.bodyUsed) {
      throw 'Body already consumed';
    }
    return new MockResponse(
        this._body, {status: this.status, statusText: this.statusText, headers: this.headers});
  }
}