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

export interface NavigationViews {
  [name: string]: NavigationNode[];
}

export interface NavigationMap {
  [url: string]: NavigationMapItem;
}

export interface NavigationMapItem {
  node: NavigationNode;
  parents: NavigationNode[];
}

const NAVIGATION_PATH = 'content/navigation.json';

@Injectable()
export class NavigationService {

  navigationViews = this.fetchNavigation();
  activeNodes = this.getActiveNodes();

  constructor(private http: Http, private location: LocationService, private logger: Logger) { }

  private fetchNavigation(): Observable<NavigationViews> {
    const response = this.http.get(NAVIGATION_PATH)
             .map(res => res.json() as NavigationViews)
             .publishLast();
    response.connect();
    return response;
  }

  private getActiveNodes() {
    const currentMapItem = combineLatest(
      this.navigationViews.map(this.computeNavMap),
      this.location.currentUrl,
      (navMap, url) => navMap[url]);
    const activeNodes = currentMapItem
      .map(item => item ? [item.node, ...item.parents] : [])
      .publishReplay();
    activeNodes.connect();
    return activeNodes;
  }

  private computeNavMap(navigation: NavigationViews): NavigationMap {
    const navMap: NavigationMap = {};
    Object.keys(navigation).forEach(key => navigation[key].forEach(node => walkNodes(node, null)));
    return navMap;

    function walkNodes(node: NavigationNode, parent: NavigationMapItem | null) {
      const item: NavigationMapItem = { node, parents: [] };
      if (parent) {
        item.parents = [parent.node, ...parent.parents];
      }
      if (node.url) {
        // only map to this item if it has a url associated with it
        navMap[node.url] = item;
      }
      if (node.children) {
        node.children.forEach(child => walkNodes(child, item));
      }
    }
  }
}
