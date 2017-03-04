import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { combineLatest } from 'rxjs/observable/combineLatest';
import 'rxjs/add/operator/publish';

import { Logger } from 'app/shared/logger.service';
import { LocationService } from 'app/shared/location.service';

export interface NavigationNode {
  url?: string;
  path?: string;
  title?: string;
  tooltip?: string;
  target?: string;
  children?: NavigationNode[];
}

export interface NavigationViews {
  [name: string]: NavigationNode;
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

  navigationViews: Observable<NavigationViews>;
  currentNode: Observable<NavigationNode>;
  activeNodes: Observable<NavigationNode[]>;

  constructor(private http: Http, location: LocationService, private logger: Logger) {

    this.navigationViews = this.fetchNavigation();

    const currentMapItem = combineLatest(
                              this.navigationViews.map(this.computeNavMap),
                              location.currentUrl,
                              (navMap, url) => navMap[url]);

    this.currentNode = currentMapItem.map(item => item.node).publish();
    this.activeNodes = currentMapItem.map(item => [item.node, ...item.parents]).publish();
  }

  private fetchNavigation(): Observable<NavigationViews> {
    const subject = new AsyncSubject<NavigationViews>();
    // TODO: logging and error handling
    this.http.get(NAVIGATION_PATH)
             .map(res => res.json() as NavigationViews)
             .subscribe(subject);
    return subject.asObservable();
  }

  private computeNavMap(navigation: NavigationViews): NavigationMap {
    const navMap: NavigationMap = {};
    Object.keys(navigation).forEach(key => walk(navigation[key], null));
    return navMap;

    function walk(node: NavigationNode, parent: NavigationMapItem) {
      const item = { node, parents: [parent.node, ...parent.parents] };
      if (node.path) {
        // only map to this item if it has a doc associated with it
        navMap[node.path] = item;
      }
      if (node.children) {
        node.children.forEach(child => walk(child, item));
      }
    }
  }
}
