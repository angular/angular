/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed, discardPeriodicTasks, fakeAsync, tick} from '@angular/core/testing';

import {WINDOW} from '../providers';

import {TableOfContentsLoader} from './table-of-contents-loader.service';
import {SCROLL_EVENT_DELAY, TableOfContentsScrollSpy} from './table-of-contents-scroll-spy.service';
import {DOCUMENT} from '@angular/common';

describe('TableOfContentsScrollSpy', () => {
  let service: TableOfContentsScrollSpy;
  let tableOfContentsLoaderSpy: jasmine.SpyObj<TableOfContentsLoader>;
  const fakeWindow = {
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  beforeEach(() => {
    tableOfContentsLoaderSpy = jasmine.createSpyObj<TableOfContentsLoader>(
      'TableOfContentsLoader',
      ['tableOfContentItems', 'updateHeadingsTopValue'],
    );
    TestBed.configureTestingModule({
      providers: [
        TableOfContentsScrollSpy,
        {
          provide: WINDOW,
          useValue: fakeWindow,
        },
        {
          provide: TableOfContentsLoader,
          useValue: tableOfContentsLoaderSpy,
        },
      ],
    });
    service = TestBed.inject(TableOfContentsScrollSpy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should activeItemId be null by default', () => {
    expect(service.activeItemId()).toBeNull();
  });

  it(`should only fire setActiveItemId every ${SCROLL_EVENT_DELAY}ms when scrolling`, fakeAsync(() => {
    const doc = TestBed.inject(DOCUMENT);
    const scrollableContainer = doc;
    const setActiveItemIdSpy = spyOn(service as any, 'setActiveItemId');

    service.startListeningToScroll(doc.querySelector('fake-selector'));

    scrollableContainer.dispatchEvent(new Event('scroll'));
    tick(SCROLL_EVENT_DELAY - 2);

    expect(setActiveItemIdSpy).not.toHaveBeenCalled();

    scrollableContainer.dispatchEvent(new Event('scroll'));
    tick(1);

    expect(setActiveItemIdSpy).not.toHaveBeenCalled();

    scrollableContainer.dispatchEvent(new Event('scroll'));
    tick(1);

    expect(setActiveItemIdSpy).toHaveBeenCalled();

    discardPeriodicTasks();
  }));
});
