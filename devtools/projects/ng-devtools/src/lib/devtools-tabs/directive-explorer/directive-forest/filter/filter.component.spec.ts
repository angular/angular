/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {FilterComponent} from './filter.component';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;
  const getMatchesCountEl = () => fixture.debugElement.query(By.css('.matches-count'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render if there is a single text match', () => {
    let count = getMatchesCountEl();
    expect(count).toBeFalsy();

    fixture.componentRef.setInput('matchesCount', 1);
    fixture.detectChanges();

    count = getMatchesCountEl();

    expect(count.nativeElement.innerText).toEqual('1 match');
  });

  it('should render if there is are multiple text matches', () => {
    let count = getMatchesCountEl();
    expect(count).toBeFalsy();

    fixture.componentRef.setInput('matchesCount', 5);
    fixture.detectChanges();

    count = getMatchesCountEl();

    expect(count.nativeElement.innerText).toEqual('5 matches');
  });

  it('should render selected match', () => {
    let count = getMatchesCountEl();
    expect(count).toBeFalsy();

    fixture.componentRef.setInput('matchesCount', 5);
    fixture.componentRef.setInput('currentMatch', 2);
    fixture.detectChanges();

    count = getMatchesCountEl();

    expect(count.nativeElement.innerText).toEqual('2 of 5');
  });
});
