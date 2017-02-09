import { fakeAsync, tick } from '@angular/core/testing';

import { DocService } from './doc.service';
import { Doc, DocMetadata } from './doc.model';
import { DocFetchingService } from './doc-fetching.service';
import { SiteMapService } from './sitemap.service';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/delay';

describe('DocService', () => {
  let docFetchingService: DocFetchingService;
  let getFileSpy: jasmine.Spy;
  let loggerSpy: any;
  let siteMapService: SiteMapService;
  let docService: DocService;

  beforeEach(() => {

    this.content = 'fake file contents';
    this.metadata = {
      id: 'fake',
      title: 'All about the fake',
      url: 'assets/documents/fake.html'
    };

    loggerSpy = jasmine.createSpyObj('logger', ['log', 'warn', 'error']);
    siteMapService = new SiteMapService();
    spyOn(siteMapService, 'getDocMetadata').and
      .callFake((id: string) => of(this.metadata).delay(0));

    docFetchingService = new DocFetchingService(null, loggerSpy);
    getFileSpy = spyOn(docFetchingService, 'getFile').and
      .callFake((url: string) => of(this.content).delay(0));

    docService = new DocService(docFetchingService, loggerSpy, siteMapService);
  });

  it('should return fake doc for fake id', fakeAsync(() => {
    docService.getDoc('fake').subscribe(doc =>
      expect(doc.content).toBe(this.content)
    );
    tick();
  }));

  it('should retrieve file once for first file request', fakeAsync(() => {
    docService.getDoc('fake').subscribe();
    expect(getFileSpy.calls.count()).toBe(0, 'no call before tick');
    tick();
    expect(getFileSpy.calls.count()).toBe(1, 'one call after tick');
  }));

  it('should retrieve file from cache the second time', fakeAsync(() => {
    docService.getDoc('fake').subscribe();
    tick();
    expect(getFileSpy.calls.count()).toBe(1, 'one call after 1st request');

    docService.getDoc('fake').subscribe();
    tick();
    expect(getFileSpy.calls.count()).toBe(1, 'still only one call after 2nd request');
  }));

  it('should pass along file error through its getDoc observable result', fakeAsync(() => {
    const err = 'deliberate file error';
    getFileSpy.and.throwError(err);
    docService.getDoc('fake').subscribe(
      doc => expect(false).toBe(true, 'should have failed'),
      error => expect(error.message).toBe(err)
    );
    tick();
  }));
});
