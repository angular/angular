/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TableOfContents} from './table-of-contents.component';
import {RouterTestingModule} from '@angular/router/testing';
import {TableOfContentsItem, TableOfContentsLevel} from '../../interfaces/index';
import {TableOfContentsLoader} from '../../services/index';
import {WINDOW} from '../../providers/index';
import {provideZonelessChangeDetection, signal} from '@angular/core';

describe('TableOfContents', () => {
  let component: TableOfContents;
  let fixture: ComponentFixture<TableOfContents>;
  const items: TableOfContentsItem[] = [
    {
      title: 'Heading 2',
      id: 'item-heading-2',
      level: TableOfContentsLevel.H2,
    },
    {
      title: 'First Heading 3',
      id: 'first-item-heading-3',
      level: TableOfContentsLevel.H3,
    },
    {
      title: 'Second Heading 3',
      id: 'second-item-heading-3',
      level: TableOfContentsLevel.H3,
    },
  ];
  const fakeWindow = {
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableOfContents, RouterTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: WINDOW,
          useValue: fakeWindow,
        },
      ],
    });

    const tableOfContentsLoaderSpy = TestBed.inject(TableOfContentsLoader);
    spyOn(tableOfContentsLoaderSpy, 'buildTableOfContent').and.returnValue();
    tableOfContentsLoaderSpy.tableOfContentItems.set(items);
    fixture = TestBed.createComponent(TableOfContents);
    fixture.componentRef.setInput('contentSourceElement', document.createElement('div'));

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call scrollToTop when user click on Back to the top button', () => {
    const spy = spyOn(component, 'scrollToTop');

    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();

    expect(spy).toHaveBeenCalledOnceWith();
  });

  it('should render items when tableOfContentItems has value', () => {
    fixture.detectChanges();

    const renderedItems = fixture.nativeElement.querySelectorAll('li');

    expect(renderedItems.length).toBe(3);
    expect(component.tableOfContentItems().length).toBe(3);
  });

  it('should append level class to element', () => {
    fixture.detectChanges();

    const h2Items = fixture.nativeElement.querySelectorAll('li.docs-toc-item-h2');
    const h3Items = fixture.nativeElement.querySelectorAll('li.docs-toc-item-h3');

    expect(h2Items.length).toBe(1);
    expect(h3Items.length).toBe(2);
  });

  it('should append active class when item is active', () => {
    fixture.detectChanges();

    const activeItem = fixture.nativeElement.querySelector('.docs-faceted-list-item-active');
    expect(activeItem).toBeDefined();
  });
});
