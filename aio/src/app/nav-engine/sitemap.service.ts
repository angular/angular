import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { Doc, NavigationNode, SiteMap } from './doc.model';
import { DocFetchingService } from './doc-fetching.service';
import { Logger } from '../logger.service';

const siteMapUrl = 'content/sitemap.json';

@Injectable()
export class SiteMapService {

  private siteMapSubject: ReplaySubject<SiteMap>;

  constructor(private http: Http, private logger: Logger) { }

  get siteMap(): Observable<SiteMap> {
    return (this.siteMapSubject ? this.siteMapSubject : this.createSiteMapSubject()).asObservable() ;
  }

  /**
   * Get metadata for a document with `id` from the SiteMap.
   * Document ids that begin with 'api/' are special-cased.
   * Returns undefined if no document metadata for that id.
   */
  getDocMetadata(id: string): Observable<NavigationNode> {
    if (!id) { return Observable.throw('no id'); }
    id = id.toLocaleLowerCase();
    return id.startsWith('api/') ?
      of(generateApiNode(id)) :
      this.siteMap.map(siteMap => siteMap.docs[id]);
  }

  /**
   * Get the metadata for a document that matches the path.
   * If more than one, picks the primary; if no primary, picks the first.
   * Paths that begin with 'api/' are special-cased.
   * Returns undefined if no document metadata for that path.
   */
  getDocMetadataForPath(path: string): Observable<NavigationNode> {
    if (!path) { return Observable.throw('no path'); }
    path = path.toLocaleLowerCase();
    return path.startsWith('api/') ?
      of(generateApiNodeForPath(path)) :
      this.siteMap.map(siteMap => {
        const nodes = siteMap.paths[path];
        if (nodes.length > 1) {
          const primary = nodes.find(node => node.primary);
          if (primary) { return primary; }
        }
        return nodes[0];
      });
  }

  private createSiteMapSubject(): ReplaySubject<SiteMap> {
    this.siteMapSubject = new ReplaySubject<SiteMap>(1);

    this.http.get(siteMapUrl)
      .map(res => res.json())
      .do(content => this.logger.log('fetched site map JSON at ', siteMapUrl) )
      .subscribe(
        navMap => this.siteMapSubject.next(createSiteMap(navMap))
      );

    return this.siteMapSubject;
  }
}

////// private helper functions ////

function createSiteMap(navMap: Map<string, NavigationNode>) {
  const siteMap: SiteMap = { navigationMap: navMap, docs: {}, paths: {}};

  // tslint:disable-next-line:forin
  for (const key in navMap) {
    adjustNode(navMap[key], siteMap, []);
  }
  return siteMap;
}

// Should never need but don't want to fail for lack of an id. The value is irrelevant.
let nextNodeId = 1;

// Fill in missing properties of NavigationMetadata from JSON
// and build siteMap.docs and siteMap.pathIds
function adjustNode(node: NavigationNode, siteMap: SiteMap, ancestorIds: string[] ) {
  node.id = node.id || node.path || node.url || '#' + nextNodeId++;
  node.id = node.id.toLocaleLowerCase();
  node.title = node.title || node.path || node.url || '';
  node.navTitle = node.navTitle || node.title;
  if ( node.tooltip === undefined ) { node.tooltip = node.title; }

  // Set ancestors; include self if this node has children
  node.ancestorIds = node.children ? ancestorIds.concat(node.id) : ancestorIds;

  if (node.path) {
    node.path = node.path.toLocaleLowerCase();
    node.path = addPathExtension(node.path);
    siteMap.docs[node.id] = node;
    siteMap.paths[node.path] = (siteMap.paths[node.path] || []).concat(node);
  }

  if (node.children) {
    node.children.forEach(e => adjustNode(e, siteMap, ancestorIds.concat(node.id)));
  }
}

function generateApiNode(id: string) {
  const path = addPathExtension(id);
  return {id, title: id, path, ancestorIds: ['api']} as NavigationNode;
}

function addPathExtension(path: string) {
  if (path) {
    if (path.endsWith('/')) {
      return path + 'index.html';
    } else if (!path.endsWith('.html')) {
      return path + '.html';
    }
  }
  return path;
}

function generateApiNodeForPath(path: string) {
  const id = removePathExtension(path);
  return {id, title: id, path, ancestorIds: ['api']} as NavigationNode;
}

function removePathExtension(path: string) {
  if (path) {
    if (path.endsWith('/index.html')) {
      return path.substring(0, path.length - 10);
    } else if (path.endsWith('.html')) {
      return path.substring(0, path.length - 5);
    }
  }
  return path;
}
