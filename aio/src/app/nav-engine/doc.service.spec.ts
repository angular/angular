import { fakeAsync, tick } from '@angular/core/testing';

import { DocService } from './doc.service';
import { Doc, DocMetadata, NavNode } from './doc.model';
import { DocFetchingService } from './doc-fetching.service';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/take';

describe('DocService', () => {
  let docFetchingService: DocFetchingService;
  let getFileSpy: jasmine.Spy;
  let loggerSpy: any;
  let docService: DocService;
  let testDoc: Doc;
  let testDocId: string;
  let testContent: string;

  beforeEach(() => {
    testDocId = 'fake';
    testContent = 'fake file contents';
    testDoc = {
      metadata: {docId: testDocId, title: 'Fake Title'} as DocMetadata,
      content: testContent
    };

    loggerSpy = jasmine.createSpyObj('logger', ['log', 'warn', 'error']);
    docFetchingService = new DocFetchingService(null, loggerSpy);
    getFileSpy = spyOn(docFetchingService, 'getDocFile').and
      .returnValue(of(testDoc).delay(0).take(1)); // take(1) -> completes

    docService = new DocService(docFetchingService, loggerSpy);
  });

  it('should return fake doc for fake id', fakeAsync(() => {
    docService.getDoc(testDocId).subscribe(doc =>
      expect(doc.content).toBe(testContent)
    );
    tick();
  }));

  it('should retrieve file once for first file request', fakeAsync(() => {
    let doc: Doc;
    expect(getFileSpy.calls.count()).toBe(0, 'no call before tick');
    docService.getDoc(testDocId).subscribe(d => doc = d);
    tick();
    expect(getFileSpy.calls.count()).toBe(1, 'one call after tick');
    expect(doc).toBe(testDoc, 'expected doc');
  }));

  it('should retrieve file from cache the second time', fakeAsync(() => {
    docService.getDoc(testDocId).subscribe(doc =>
      expect(doc).toBe(testDoc, 'expected doc from server')
    );
    tick();
    expect(getFileSpy.calls.count()).toBe(1, 'one call after 1st request');

    docService.getDoc(testDocId).subscribe(doc =>
      expect(doc).toBe(testDoc, 'expected doc from cache')
    );
    tick();
    expect(getFileSpy.calls.count()).toBe(1, 'still only one call after 2nd request');
  }));

  it('should pass along file error through its getDoc observable result', fakeAsync(() => {

    const err = 'deliberate file error';
    getFileSpy.and.returnValue(
      // simulate async error in the file retrieval
      of('').delay(0).map(() => { throw new Error(err); })
    );

    docService.getDoc(testDocId).subscribe(
      doc => expect(false).toBe(true, 'should have failed'),
      error => expect(error.message).toBe(err)
    );
    tick();
  }));
});
