/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as browserSync from 'browser-sync';
import * as http from 'http';
import * as path from 'path';
import * as send from 'send';

/**
 * Dev Server implementation that uses browser-sync internally. This dev server
 * supports Bazel runfile resolution in order to make it work in a Bazel sandbox
 * environment and on Windows (with a runfile manifest file).
 */
export class DevServer {
  /** Instance of the browser-sync server. */
  server = browserSync.create();

  /** Options of the browser-sync server. */
  options: browserSync.Options = {
    open: false,
    online: false,
    port: this.port,
    notify: false,
    ghostMode: false,
    server: {
      directory: false,
      middleware: [(req, res) => this._bazelMiddleware(req, res)],
    },
  };

  constructor(
      readonly port: number, private _rootPaths: string[],
      private _historyApiFallback: boolean = false) {}

  /** Starts the server on the given port. */
  async start() {
    return new Promise((resolve, reject) => {
      this.server.init(this.options, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /** Reloads all browsers that currently visit a page from the server. */
  reload() {
    this.server.reload();
  }

  /**
   * Middleware function used by BrowserSync. This function is responsible for
   * Bazel runfile resolution and HTML History API support.
   */
  private _bazelMiddleware(req: http.IncomingMessage, res: http.ServerResponse) {
    if (!req.url) {
      res.statusCode = 500;
      res.end('Error: No url specified');
      return;
    }

    // Detect if the url escapes the server's root path
    for (const rootPath of this._rootPaths) {
      const absoluteRootPath = path.resolve(rootPath);
      const absoluteJoinedPath = path.resolve(path.posix.join(rootPath, getManifestPath(req.url)));
      if (!absoluteJoinedPath.startsWith(absoluteRootPath)) {
        res.statusCode = 500;
        res.end('Error: Detected directory traversal');
        return;
      }
    }

    // Implements the HTML history API fallback logic based on the requirements of the
    // "connect-history-api-fallback" package. See the conditions for a request being redirected
    // to the index: https://github.com/bripkens/connect-history-api-fallback#introduction
    if (this._historyApiFallback && req.method === 'GET' && !req.url.includes('.') &&
        req.headers.accept && req.headers.accept.includes('text/html')) {
      req.url = '/index.html';
    }

    const resolvedPath = this._resolveUrlFromRunfiles(req.url);

    if (resolvedPath === null) {
      res.statusCode = 404;
      res.end('Page not found');
      return;
    }

    send(req, resolvedPath).pipe(res);
  }

  /** Resolves a given URL from the runfiles using the corresponding manifest path. */
  private _resolveUrlFromRunfiles(url: string): string|null {
    for (let rootPath of this._rootPaths) {
      try {
        return require.resolve(path.posix.join(rootPath, getManifestPath(url)));
      } catch {
      }
    }
    return null;
  }
}

/** Gets the manifest path for a given url */
function getManifestPath(url: string) {
  // Remove the leading slash from the URL. Manifest paths never
  // start with a leading slash.
  return url.substring(1);
}
