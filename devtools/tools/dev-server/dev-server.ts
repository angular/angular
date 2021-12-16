/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import browserSync from 'browser-sync';
import {existsSync, readFileSync} from 'fs';
import http from 'http';
import path from 'path';
import send from 'send';

/**
 * Dev Server implementation that uses browser-sync internally. This dev server
 * supports Bazel runfile resolution in order to make it work in a Bazel sandbox
 * environment and on Windows (with a runfile manifest file).
 */
export class DevServer {
  /** Cached content of the index.html. */
  private _index: string|null = null;

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
      readonly port: number,
      private _rootPaths: string[],
      bindUi: boolean,
      private _historyApiFallback: boolean = false,
  ) {
    if (bindUi === false) {
      this.options.ui = false;
    }
  }

  /** Starts the server on the given port. */
  start() {
    return new Promise<void>((resolve, reject) => {
      this.server.init(this.options, err => {
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
      res.end(this._getIndex());
    } else {
      const resolvedPath = this._resolveUrlFromRunfiles(req.url);

      if (resolvedPath === null) {
        res.statusCode = 404;
        res.end('Page not found');
        return;
      }

      send(req, resolvedPath).pipe(res);
    }
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

  /** Gets the content of the index.html. */
  private _getIndex(): string {
    if (!this._index) {
      const indexPath = this._resolveUrlFromRunfiles('/index.html');

      if (!indexPath) {
        throw Error('Could not resolve dev server index.html');
      }

      // We support specifying a variables.json file next to the index.html which will be inlined
      // into the dev app as a `script` tag. It is used to pass in environment-specific variables.
      const varsPath = path.join(path.dirname(indexPath), 'variables.json');
      const scriptTag = '<script>window.DEV_APP_VARIABLES = ' +
          (existsSync(varsPath) ? readFileSync(varsPath, 'utf8') : '{}') + ';</script>';
      const content = readFileSync(indexPath, 'utf8');
      const headIndex = content.indexOf('</head>');
      this._index = content.slice(0, headIndex) + scriptTag + content.slice(headIndex);
    }

    return this._index;
  }
}

/** Gets the manifest path for a given url */
function getManifestPath(url: string) {
  // Remove the leading slash from the URL. Manifest paths never
  // start with a leading slash.
  return url.substring(1);
}
