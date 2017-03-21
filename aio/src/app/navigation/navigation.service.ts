import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { combineLatest } from 'rxjs/observable/combineLatest';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/publishLast';

import { Logger } from 'app/shared/logger.service';
import { LocationService } from 'app/shared/location.service';

import { NavigationNode } from './navigation-node';
export { NavigationNode } from './navigation-node';


export type NavigationResponse = {__versionInfo: VersionInfo } & { [name: string]: NavigationNode[]|VersionInfo };

export interface NavigationViews {
  [name: string]: NavigationNode[];
}

export interface NavigationMap {
  [url: string]: NavigationNode;
}

export interface VersionInfo {
  raw: string;
  major: number;
  minor: number;
  patch: number;
  prerelease: string[];
  build: string;
  version: string;
  codeName: string;
  isSnapshot: boolean;
  full: string;
  branch: string;
  commitSHA: string;
}

const navigationPath = 'content/navigation.json';


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
   * An observable array of nodes that indicate which nodes in the `navigationViews` match the current URL location
   */
  selectedNodes: Observable<NavigationNode[]>;

  constructor(private http: Http, private location: LocationService, private logger: Logger) {
    const navigationInfo = this.fetchNavigationInfo();
    // The version information is packaged inside the navigation response to save us an extra request.
    this.versionInfo = this.getVersionInfo(navigationInfo);
    this.navigationViews = this.getNavigationViews(navigationInfo);
    this.selectedNodes = this.getSelectedNodes(this.navigationViews);
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
    const versionInfo = navigationInfo.map(response => response.__versionInfo).publishReplay(1);
    versionInfo.connect();
    return versionInfo;
  }

  private getNavigationViews(navigationInfo: Observable<NavigationResponse>): Observable<NavigationViews> {
    const navigationViews = navigationInfo.map(response => unpluck(response, '__versionInfo')).publishReplay(1);
    navigationViews.connect();
    return navigationViews;
  }

  /**
   * Get an observable that will list the nodes that are currently selected
   * We use `publishReplay(1)` because otherwise subscribers will have to wait until the next
   * URL change before they receive an emission.
   * See above for discussion of using `connect`.
   */
  private getSelectedNodes(navigationViews: Observable<NavigationViews>) {
    const selectedNodes = combineLatest(
      navigationViews.map(this.computeUrlToNodesMap),
      this.location.currentUrl,
      (navMap, url) => navMap[url] || [])
      .publishReplay(1);
    selectedNodes.connect();
    return selectedNodes;
  }

  /**
   * Compute a mapping from URL to an array of nodes, where the first node in the array
   * is the one that matches the URL and the rest are the ancestors of that node.
   *
   * @param navigation A collection of navigation nodes that are to be mapped
   */
  private computeUrlToNodesMap(navigation: NavigationViews) {
    const navMap: NavigationMap = {};
    Object.keys(navigation).forEach(key => navigation[key].forEach(node => walkNodes(node)));
    return navMap;

    function walkNodes(node: NavigationNode, ancestors: NavigationNode[] = []) {
      const nodes = [node, ...ancestors];
      if (node.url) {
        // only map to this node if it has a url associated with it
        navMap[node.url] = nodes;
      }
      if (node.children) {
        node.children.forEach(child => walkNodes(child, nodes));
      }
    }
  }
}

function unpluck(obj: any, property: string) {
  const result = Object.assign({}, obj);
  delete result[property];
  return result;
}
