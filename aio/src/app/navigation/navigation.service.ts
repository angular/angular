import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { combineLatest } from 'rxjs/observable/combineLatest';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publishLast';
import 'rxjs/add/operator/publishReplay';

import { Logger } from 'app/shared/logger.service';
import { LocationService } from 'app/shared/location.service';
import { CONTENT_URL_PREFIX } from 'app/documents/document.service';

// Import and re-export the Navigation model types
import { CurrentNode, NavigationNode, NavigationResponse, NavigationViews, VersionInfo } from './navigation.model';
export { CurrentNode, NavigationNode, NavigationResponse, NavigationViews, VersionInfo } from './navigation.model';

const navigationPath = CONTENT_URL_PREFIX + 'navigation.json';

@Injectable()
export class NavigationService {
  /**
   * An observable collection of NavigationNode trees, which can be used to render navigational menus
   */
  navigationViews: Observable<NavigationViews>;

  /**
   * The current version of doc-app that we are running
   */
  versionInfo: Observable<VersionInfo>;

  /**
   * An observable of the current node with info about the
   * node (if any) that matches the current URL location
   * including its navigation view and its ancestor nodes in that view
   */
  currentNode: Observable<CurrentNode>;

  constructor(private http: Http, private location: LocationService, private logger: Logger) {
    const navigationInfo = this.fetchNavigationInfo();
    this.navigationViews = this.getNavigationViews(navigationInfo);

    this.currentNode = this.getCurrentNode(this.navigationViews);
    // The version information is packaged inside the navigation response to save us an extra request.
    this.versionInfo = this.getVersionInfo(navigationInfo);
  }

  /**
   * Get an observable that fetches the `NavigationResponse` from the server.
   * We create an observable by calling `http.get` but then publish it to share the result
   * among multiple subscribers, without triggering new requests.
   * We use `publishLast` because once the http request is complete the request observable completes.
   * If you use `publish` here then the completed request observable will cause the subscribed observables to complete too.
   * We `connect` to the published observable to trigger the request immediately.
   * We could use `.refCount` here but then if the subscribers went from 1 -> 0 -> 1 then you would get
   * another request to the server.
   * We are not storing the subscription from connecting as we do not expect this service to be destroyed.
   */
  private fetchNavigationInfo(): Observable<NavigationResponse> {
    const navigationInfo = this.http.get(navigationPath)
      .map(res => res.json() as NavigationResponse)
      .publishLast();
    navigationInfo.connect();
    return navigationInfo;
  }

  private getVersionInfo(navigationInfo: Observable<NavigationResponse>) {
    const versionInfo = navigationInfo
      .map(response => response.__versionInfo)
      .publishLast();
    versionInfo.connect();
    return versionInfo;
  }

  private getNavigationViews(navigationInfo: Observable<NavigationResponse>): Observable<NavigationViews> {
    const navigationViews = navigationInfo
      .map(response => {
        const views = Object.assign({}, response);
        Object.keys(views).forEach(key => {
          if (key[0] === '_') { delete views[key]; }
        });
        return views as NavigationViews;
      })
      .publishLast();
    navigationViews.connect();
    return navigationViews;
  }

  /**
   * Get an observable of the current node (the one that matches the current URL)
   * We use `publishReplay(1)` because otherwise subscribers will have to wait until the next
   * URL change before they receive an emission.
   * See above for discussion of using `connect`.
   */
  private getCurrentNode(navigationViews: Observable<NavigationViews>): Observable<CurrentNode> {
    const currentNode = combineLatest(
      navigationViews.map(views => this.computeUrlToNavNodesMap(views)),
      this.location.currentPath,

      (navMap, url) => {
        const urlKey = url.startsWith('api/') ? 'api' : url;
        return navMap[urlKey] || { view: '', url: urlKey, nodes: [] };
      })
      .publishReplay(1);
    currentNode.connect();
    return currentNode;
  }

  /**
   * Compute a mapping from URL to an array of nodes, where the first node in the array
   * is the one that matches the URL and the rest are the ancestors of that node.
   *
   * @param navigation - A collection of navigation nodes that are to be mapped
   */
  private computeUrlToNavNodesMap(navigation: NavigationViews) {
    const navMap = new Map<string, CurrentNode>();
    Object.keys(navigation)
      .forEach(view => navigation[view]
        .forEach(node => this.walkNodes(view, navMap, node)));
    return navMap;
  }

  /**
   * Add tooltip to node if it doesn't have one and have title.
   * If don't want tooltip, specify `"tooltip": ""` in navigation.json
   */
  private ensureHasTooltip(node: NavigationNode) {
    const title = node.title;
    const tooltip = node.tooltip;
    if (tooltip == null && title ) {
      // add period if no trailing punctuation
      node.tooltip = title + (/[a-zA-Z0-9]$/.test(title) ? '.' : '');
    }
  }
  /**
   * Walk the nodes of a navigation tree-view,
   * patching them and computing their ancestor nodes
   */
  private walkNodes(
    view: string, navMap: Map<string, CurrentNode>,
    node: NavigationNode, ancestors: NavigationNode[] = []) {
      const nodes = [node, ...ancestors];
      const url = node.url;
      this.ensureHasTooltip(node);

      // only map to this node if it has a url
      if (url) {
        // Strip off trailing slashes from nodes in the navMap - they are not relevant to matching
        navMap[url.replace(/\/$/, '')] = { url, view, nodes };
      }

      if (node.children) {
        node.children.forEach(child => this.walkNodes(view, navMap, child, nodes));
      }
    }
}
