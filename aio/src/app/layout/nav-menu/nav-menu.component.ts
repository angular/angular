import { Component, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CurrentNode, NavigationService, NavigationViews, NavigationNode } from 'app/navigation/navigation.service';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';

const sideNav = 'SideNav';

@Component({
  selector: 'aio-nav-menu',
  template: `
  <aio-nav-item *ngFor="let node of nodes | async" [node]="node" [selectedNodes]="selectedNodes | async">
  </aio-nav-item>`
})
export class NavMenuComponent implements OnInit, OnDestroy {
  isSideNavDoc = false;
  nodes: Observable<NavigationNode[]>;
  selectedNodes: Observable<NavigationNode[]>;
  onDestroy = new Subject();

  constructor(navigationService: NavigationService) {
    this.nodes = navigationService.navigationViews
      .map(views => views[sideNav])
      .takeUntil(this.onDestroy);

    this.selectedNodes = navigationService.currentNode
      .map(current => current && current.view === sideNav ? current.nodes : [])
      .takeUntil(this.onDestroy);
  }

  ngOnInit() {
    // The current doc is in side nav if there are selected nodes
    this.selectedNodes.subscribe(nodes => this.isSideNavDoc = !!nodes.length);
  }

  // Component never destroyed but future proof it
  ngOnDestroy() {
    this.onDestroy.next();
  }
}
