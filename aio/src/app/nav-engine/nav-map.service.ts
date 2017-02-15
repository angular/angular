import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

import { Doc, NavNode, NavMap } from './doc.model';
import { DocFetchingService } from './doc-fetching.service';
import { Logger } from '../logger.service';

const navMapUrl = 'content/navmap.json';

@Injectable()
export class NavMapService {

  private getDocPath: (string) => string;
  private navMapSubject: ReplaySubject<NavMap>;
  private nextNodeId = 1;

  constructor(
    docFetchingService: DocFetchingService,
    private http: Http,
    private logger: Logger) {
      this.getDocPath = docFetchingService.getPath.bind(docFetchingService);
    }

  get navMap(): Observable<NavMap> {
    return (this.navMapSubject ? this.navMapSubject : this.createNavMapSubject()).asObservable() ;
  }

  private createNavMapSubject(): ReplaySubject<NavMap> {
    this.navMapSubject = new ReplaySubject<NavMap>(1);

    this.http.get(navMapUrl)
      .map(res => res.json().nodes)
      .do(() => this.logger.log(`Fetched navigation map JSON at '${navMapUrl}'`))
      .subscribe(
        navNodes => this.navMapSubject.next(this.createNavMap(navNodes))
      );

    return this.navMapSubject;
  }


  ////// private helper functions ////

  private createNavMap(nodes: NavNode[]) {
    nodes = this.removeHidden(nodes);
    const navMap: NavMap = { nodes, docs: new Map<string, NavNode>()};
    nodes.forEach(node => this.adjustNode(node, navMap, []));
    return navMap;
  }

  // Adjust properties of a node from JSON and build navMap.docs
  private adjustNode(node: NavNode, navMap: NavMap, ancestorIds: number[] ) {
    node.id = this.nextNodeId++;
    node.ancestorIds = ancestorIds;
    if ( node.tooltip === undefined ) { node.tooltip = node.navTitle; }

    if (node.docId) {
      // This node is associated with a document
      node.docId = node.docId.toLocaleLowerCase();
      node.docPath = this.getDocPath(node.docId);
      navMap.docs.set(node.docId, node);
    }


    if (node.children) {
      // Ancestors include self when this node has children
      node.ancestorIds = ancestorIds.concat(node.id);
      node.children.forEach(n => this.adjustNode(n, navMap, node.ancestorIds));
    }
  }

  private removeHidden(nodes: NavNode[]) {
    return nodes.filter(node => {
      if (node['hide'] === true ) { return false; }
      if (node.children) {
        node.children = this.removeHidden(node.children);
      }
      return true;
    });
  }
}

