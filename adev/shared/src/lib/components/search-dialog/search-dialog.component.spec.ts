/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SearchDialog} from './search-dialog.component';
import {WINDOW} from '../../providers';
import {Search} from '../../services';
import {signal} from '@angular/core';
import {FakeEventTarget} from '../../utils/test.utils';

describe('SearchDialog', () => {
  let component: SearchDialog;
  let fixture: ComponentFixture<SearchDialog>;

  const fakeSearch = {
    keyDown: signal(null),
    searchQuery: signal(''),
    searchResults: signal([]),
  };
  const fakeWindow = new FakeEventTarget();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchDialog],
      providers: [
        {
          provide: Search,
          useValue: fakeSearch,
        },
        {
          provide: WINDOW,
          useValue: fakeWindow,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
