import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { Doc, NavigationMap, NavigationMapEntry, SiteMap } from './doc.model';
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
  getDocMetadata(id: string): Observable<NavigationMapEntry> {
    if (!id) { return Observable.throw('no id'); }
    id = id.toLocaleLowerCase();
    return id.startsWith('api/') ?
      of(generateApiMetadata(id)) :
      this.siteMap.map(siteMap => siteMap.docs[id]);
  }

  /**
   * Get the metadata for a document that matches the path.
   * If more than one, picks the primary; if no primary, picks the first.
   * Paths that begin with 'api/' are special-cased.
   * Returns undefined if no document metadata for that path.
   */
  getDocMetadataForPath(path: string): Observable<NavigationMapEntry> {
    if (!path) { return Observable.throw('no path'); }
    path = path.toLocaleLowerCase();
    return path.startsWith('api/') ?
      of(generateApiMetadataForPath(path)) :
      this.siteMap.map(siteMap => {
        const entries = siteMap.paths[path];
        if (entries.length > 1) {
          const primary = entries.find(entry => entry.primary);
          if (primary) { return primary; }
        }
        return entries[0];
      });
  }

  private createSiteMapSubject(): ReplaySubject<SiteMap> {
    this.siteMapSubject = new ReplaySubject<SiteMap>(1);

    this.http.get(siteMapUrl)
      .map(res => res.json() as NavigationMap)
      .do(content => this.logger.log('fetched site map JSON at ', siteMapUrl) )
      .subscribe(
        navMap => this.siteMapSubject.next(createSiteMap(navMap))
      );

    return this.siteMapSubject;
  }
}

////// private helper functions ////

function createSiteMap(navMap: NavigationMap) {
  const siteMap: SiteMap = { docs: {}, navigationMap: navMap, paths: {}};

  // tslint:disable-next-line:forin
  for (const key in navMap) {
    adjustMapEntry(navMap[key], siteMap, []);
  }
  return siteMap;
}

// Should never need but don't want to fail for lack of an id. The value is irrelevant.
let nextEntryId = 1;

// Fill in missing properties of an NavigationMapEntry from JSON
// and build siteMap.docs and siteMap.pathIds
function adjustMapEntry(entry: NavigationMapEntry, siteMap: SiteMap, ancestorIds: string[] ) {
  entry.id = entry.id || entry.path || entry.url || '#' + nextEntryId++;
  entry.id = entry.id.toLocaleLowerCase();
  entry.title = entry.title || entry.path || entry.url || '';
  entry.navTitle = entry.navTitle || entry.title;
  if ( entry.tooltip === undefined ) { entry.tooltip = entry.title; }

  // Set ancestors; include self if this entry is also a container of other entries
  entry.ancestorIds = entry.entries ? ancestorIds.concat(entry.id) : ancestorIds;

  if (entry.path) {
    entry.path = entry.path.toLocaleLowerCase();
    entry.path = addPathExtension(entry.path);
    siteMap.docs[entry.id] = entry;
    siteMap.paths[entry.path] = (siteMap.paths[entry.path] || []).concat(entry);
  }

  if (entry.entries) {
    entry.entries.forEach(e => adjustMapEntry(e, siteMap, ancestorIds.concat(entry.id)));
  }
}

function generateApiMetadata(id: string) {
  const path = addPathExtension(id);
  return {id, title: id, path, ancestorIds: ['api']} as NavigationMapEntry;
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

function generateApiMetadataForPath(path: string) {
  const id = removePathExtension(path);
  return {id, title: id, path, ancestorIds: ['api']} as NavigationMapEntry;
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
