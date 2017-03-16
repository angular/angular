import { ReflectiveInjector } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { FileLoaderService } from 'app/shared/file-loader.service';
import { TestFileLoaderService } from 'testing/file-loader.service';
import { LocationService } from 'app/shared/location.service';
import { MockLocationService } from 'testing/location.service';
import { Logger } from 'app/shared/logger.service';
import { MockLogger } from 'testing/logger.service';
import { DocumentService, DocumentContents } from './document.service';

const CONTENT_URL_PREFIX = 'docs/';

function createInjector(initialUrl: string) {
  return ReflectiveInjector.resolveAndCreate([
      DocumentService,
      { provide: LocationService, useFactory: () => new MockLocationService(initialUrl) },
        { provide: FileLoaderService, useClass: TestFileLoaderService },
      { provide: Logger, useClass: MockLogger }
  ]);
}

function getServices(initialUrl: string = '') {
  const injector = createInjector(initialUrl);
  return {
    loader: injector.get(FileLoaderService) as TestFileLoaderService,
    location: injector.get(LocationService) as MockLocationService,
    service: injector.get(DocumentService) as DocumentService,
    logger: injector.get(Logger) as MockLogger
  };
}

describe('DocumentService', () => {

  it('should be creatable', () => {
    const { service } = getServices();
    expect(service).toBeTruthy();
  });

  describe('currentDocument', () => {

    it('should fetch a document for the initial location url', () => {
      const { service, loader } = getServices('initial/url');
      const connections = loader.connectionsArray;
      service.currentDocument.subscribe();

      expect(connections.length).toEqual(1);
      expect(connections[0].url).toEqual(CONTENT_URL_PREFIX + 'initial/url.json');
      expect(loader.connectionsArray[0].url).toEqual(CONTENT_URL_PREFIX + 'initial/url.json');
    });

    it('should emit a document each time the location changes', () => {
      let latestDocument: DocumentContents;
      const doc0 = { title: 'doc 0' };
      const doc1 = { title: 'doc 1' };
      const { service, loader, location } = getServices('initial/url');
      const connections = loader.connectionsArray;

      service.currentDocument.subscribe(doc => latestDocument = doc);
      expect(latestDocument).toBeUndefined();

      connections[0].mockRespond(doc0);
      expect(latestDocument).toEqual(doc0);

      location.urlSubject.next('new/url');
      connections[1].mockRespond(doc1);
      expect(latestDocument).toEqual(doc1);
    });

    it('should emit the not-found document if the document is not found on the server', () => {
      const { service, loader } = getServices('missing/url');
      const connections = loader.connectionsArray;
      service.currentDocument.subscribe();

      connections[0].mockRespond(undefined, { status: 404, statusText: 'NOT FOUND'});
      expect(connections.length).toEqual(2);
      expect(connections[1].url).toEqual(CONTENT_URL_PREFIX + 'file-not-found.json');
    });

    it('should emit a hard-coded not-found document if the not-found document is not found on the server', () => {
      let currentDocument: DocumentContents;
      const notFoundDoc = { title: 'Not Found', contents: 'Document not found' };
      const nextDoc = { title: 'Next Doc' };
      const { service, loader, location } = getServices('file-not-found');
      const connections = loader.connectionsArray;
      service.currentDocument.subscribe(doc => currentDocument = doc);

      connections[0].mockRespond(null, { status: 404, statusText: 'NOT FOUND'});
      expect(connections.length).toEqual(1);
      expect(currentDocument).toEqual(notFoundDoc);

      // now check that we haven't killed the currentDocument observable sequence
      location.urlSubject.next('new/url');
      connections[1].mockRespond(nextDoc);
      expect(currentDocument).toEqual(nextDoc);
    });

    it('should not make a request to the server if the doc is in the cache already', () => {
      let latestDocument: DocumentContents;
      let subscription: Subscription;

      const doc0 = { title: 'doc 0' };
      const doc1 = { title: 'doc 1' };
      const { service, loader, location } = getServices('url/0');
      const connections = loader.connectionsArray;

      subscription = service.currentDocument.subscribe(doc => latestDocument = doc);
      expect(connections.length).toEqual(1);
      connections[0].mockRespond(doc0);
      expect(latestDocument).toEqual(doc0);
      subscription.unsubscribe();

      // modify the response so we can check that future subscriptions do not trigger another request
      connections[0].mockRespond({ title: 'error 0' });

      subscription = service.currentDocument.subscribe(doc => latestDocument = doc);
      location.urlSubject.next('url/1');
      expect(connections.length).toEqual(2);
      connections[1].mockRespond(doc1);
      expect(latestDocument).toEqual(doc1);
      subscription.unsubscribe();

      // modify the response so we can check that future subscriptions do not trigger another request
      connections[1].mockRespond({ title: 'error 1' });

      subscription = service.currentDocument.subscribe(doc => latestDocument = doc);
      location.urlSubject.next('url/0');
      expect(connections.length).toEqual(2);
      expect(latestDocument).toEqual(doc0);
      subscription.unsubscribe();

      subscription = service.currentDocument.subscribe(doc => latestDocument = doc);
      location.urlSubject.next('url/1');
      expect(connections.length).toEqual(2);
      expect(latestDocument).toEqual(doc1);
      subscription.unsubscribe();
    });
  });

  describe('computeMap', () => {
    it('should map the "empty" location to the correct document request', () => {
      let latestDocument: DocumentContents;
      const { service, loader } = getServices();
      service.currentDocument.subscribe(doc => latestDocument = doc);

      expect(loader.connectionsArray[0].url).toEqual(CONTENT_URL_PREFIX + 'index.json');
    });
  });
});
