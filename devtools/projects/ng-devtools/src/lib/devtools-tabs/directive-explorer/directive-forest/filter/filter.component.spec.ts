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
  const emitFilterEvent = (filter: string) =>
    component.emitFilter({target: {value: filter} as any} as Event);

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
    expect(getMatchesCountEl()).toBeFalsy();

    fixture.componentRef.setInput('matchesCount', 1);
    fixture.detectChanges();

    expect(getMatchesCountEl().nativeElement.innerText).toEqual('1 match');
  });

  it('should render if there is are multiple text matches', () => {
    expect(getMatchesCountEl()).toBeFalsy();

    fixture.componentRef.setInput('matchesCount', 5);
    fixture.detectChanges();

    expect(getMatchesCountEl().nativeElement.innerText).toEqual('5 matches');
  });

  it('should render selected match', () => {
    expect(getMatchesCountEl()).toBeFalsy();

    fixture.componentRef.setInput('matchesCount', 5);
    fixture.componentRef.setInput('currentMatch', 2);
    fixture.detectChanges();

    expect(getMatchesCountEl().nativeElement.innerText).toEqual('2 of 5');
  });

  it('should emit a default filter function that returns an empty matches array, if no match', () => {
    component.filter.subscribe((filterFn) => {
      const match = filterFn('Foo Bar');

      expect(match.length).toEqual(0);
    });

    emitFilterEvent('Baz');
  });

  it('should emit a default filter function that returns match indices, if there is a match', () => {
    component.filter.subscribe((filterFn) => {
      const matches = filterFn('Foo Bar');

      expect(matches.length).toEqual(1);

      const [match] = matches;
      expect(match.startIdx).toEqual(4);
      expect(match.endIdx).toEqual(7);
    });

    emitFilterEvent('Bar');
  });

  it('should emit a default filter function that returns match indices, if there is a full match', () => {
    component.filter.subscribe((filterFn) => {
      const matches = filterFn('Foo Bar');

      expect(matches.length).toEqual(1);

      const [match] = matches;
      expect(match.startIdx).toEqual(0);
      expect(match.endIdx).toEqual(7);
    });

    emitFilterEvent('Foo Bar');
  });

  it('should emit a default filter function that returns match indices, if there is a match (case insensitive)', () => {
    component.filter.subscribe((filterFn) => {
      const matches = filterFn('Foo Bar Baz');

      expect(matches.length).toEqual(1);

      const [match] = matches;
      expect(match.startIdx).toEqual(4);
      expect(match.endIdx).toEqual(7);
    });

    emitFilterEvent('bar');
  });
});
