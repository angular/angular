import { fakeAsync, tick } from '@angular/core/testing';

import { DocService } from './doc.service';
import { Doc, NavigationMapEntry } from './doc.model';
import { DocFetchingService } from './doc-fetching.service';
import { SiteMapService } from './sitemap.service';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/delay';

describe('DocService', () => {
  let docFetchingService: DocFetchingService;
  let getFileSpy: jasmine.Spy;
  let fakeDocMetadata: NavigationMapEntry;
  let loggerSpy: any;
  let siteMapServiceSpy: any;
  let docService: DocService;

  beforeEach(() => {

    this.content = 'fake file contents';
    fakeDocMetadata = {
      id: 'fake',
      title: 'All about the fake',
      path: 'guide/fake.html'
    } as NavigationMapEntry;

    loggerSpy = jasmine.createSpyObj('logger', ['log', 'warn', 'error']);
    siteMapServiceSpy = jasmine.createSpyObj('SiteMapService', ['getDocMetadata']);
    siteMapServiceSpy.getDocMetadata.and.returnValue(of(fakeDocMetadata).delay(0));

    docFetchingService = new DocFetchingService(null, loggerSpy);
    getFileSpy = spyOn(docFetchingService, 'getFile').and
      .callFake((url: string) => of(this.content).delay(0));

    docService = new DocService(docFetchingService, loggerSpy, siteMapServiceSpy);
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

  it('should try to get file from expected URL for first file request', fakeAsync(() => {
    docService.getDoc('fake').subscribe();
    tick();
    expect(getFileSpy.calls.argsFor(0)[0]).toBe(fakeDocMetadata.path);
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
