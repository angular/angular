/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {rewriteUrlInstruction, FetchInstruction, Operation, Plugin, PluginFactory, VersionWorker, UrlConfig, UrlMatcher,} from '@angular/service-worker/sdk';

interface RouteMap {
  [url: string]: RouteConfig|UrlConfig;
}

interface RouteConfig {
  prefix?: boolean;
  onlyWithoutExtension?: boolean;
}

interface RouteRedirectionManifest {
  index: string;
  routes?: RouteMap;
}

/**
 * @experimental
 */
export function RouteRedirection(): PluginFactory<RouteRedirectionImpl> {
  return (worker: VersionWorker) => new RouteRedirectionImpl(worker);
}

/**
 * @experimental
 */
export class RouteRedirectionImpl implements Plugin<RouteRedirectionImpl> {
  constructor(public worker: VersionWorker) {}

  private get routeManifest(): RouteRedirectionManifest {
    return this.worker.manifest['routing'] as RouteRedirectionManifest;
  }

  private hasExtension(path: string): boolean {
    const lastSegment = path.substr(path.lastIndexOf('/') + 1);
    return lastSegment.indexOf('.') !== -1;
  }

  setup(operations: Operation[]): void {
    // No setup needed.
  }

  fetch(req: Request): FetchInstruction {
    const manifest = this.routeManifest;
    if (!manifest || !manifest.routes) {
      return null !;
    }
    let [base, path] = parseUrl(req.url);
    const matchesRoutingTable = Object.keys(manifest.routes).some(route => {
      const config: any = manifest.routes ![route];
      if (config['match']) {
        const matcher = new UrlMatcher(route, config as UrlConfig, this.worker.adapter.scope);
        return matcher.matches(req.url);
      } else {
        const oldConfig = config as RouteConfig;
        const matchesPath = oldConfig.prefix ? path.indexOf(route) === 0 : path === route;
        const matchesPathAndExtension =
            matchesPath && (!oldConfig.onlyWithoutExtension || !this.hasExtension(path));
        return matchesPathAndExtension;
      }
    });
    if (matchesRoutingTable) {
      return rewriteUrlInstruction(this.worker, req, base + manifest.index);
    } else {
      return null !;
    }
  }
}

function parseUrl(full: string) {
  let isHttp = full.toLowerCase().startsWith('http://');
  let isHttps = full.toLowerCase().startsWith('https://');
  if (!isHttp && !isHttps) {
    // Relative url.
    return ['', full];
  }

  let protocol = 'http://';
  let protocolSuffix = full.substr('http://'.length);
  if (isHttps) {
    protocol = 'https://';
    protocolSuffix = full.substr('https://'.length);
  }
  let rootSlash = protocolSuffix.indexOf('/');
  if (rootSlash === -1) {
    return [full, '/'];
  }
  return [full.substr(0, protocol.length + rootSlash), protocolSuffix.substr(rootSlash)];
}