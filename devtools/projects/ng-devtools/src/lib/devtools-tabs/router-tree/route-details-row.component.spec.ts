/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {RouteDetailsRowComponent} from './route-details-row.component';

describe('RouteDetailsRowComponent', () => {
  let component: RouteDetailsRowComponent;
  let fixture: ComponentFixture<RouteDetailsRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteDetailsRowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RouteDetailsRowComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('label', 'Route Title');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a label and text data', () => {
    fixture.componentRef.setInput('label', 'Route Title');
    fixture.componentRef.setInput('data', 'Route Data');
    fixture.detectChanges();

    const labelElement = fixture.debugElement.query(By.css('th'));
    expect(labelElement.nativeElement.innerText).toEqual('Route Title');

    const dataElements = fixture.debugElement.queryAll(By.css('td'));
    expect(dataElements.length).toEqual(1);
    expect(dataElements[0].nativeElement.innerText).toEqual('Route Data');
  });

  it('should render a label and flag data true', () => {
    fixture.componentRef.setInput('label', 'Route Title');
    fixture.componentRef.setInput('type', 'flag');
    fixture.componentRef.setInput('data', 'true');
    fixture.detectChanges();

    const labelElement = fixture.debugElement.query(By.css('th'));
    expect(labelElement.nativeElement.innerText).toEqual('Route Title');

    const dataElements = fixture.debugElement.queryAll(By.css('.tag-active'));
    expect(dataElements.length).toEqual(1);
    expect(dataElements[0].nativeElement.innerText).toEqual('true');
  });

  it('should render a label and flag data false', () => {
    fixture.componentRef.setInput('label', 'Route Title');
    fixture.componentRef.setInput('type', 'flag');
    fixture.componentRef.setInput('data', false);
    fixture.detectChanges();

    const labelElement = fixture.debugElement.query(By.css('th'));
    expect(labelElement.nativeElement.innerText).toEqual('Route Title');

    const dataElements = fixture.debugElement.queryAll(By.css('.tag-inactive'));
    expect(dataElements.length).toEqual(1);
    expect(dataElements[0].nativeElement.innerText).toEqual('false');
  });

  it('should render a label and chip data', () => {
    fixture.componentRef.setInput('label', 'Route Title');
    fixture.componentRef.setInput('type', 'chip');
    fixture.componentRef.setInput('data', 'Component Name');
    fixture.detectChanges();

    const labelElement = fixture.debugElement.query(By.css('th'));
    expect(labelElement.nativeElement.innerText).toEqual('Route Title');

    const dataElements = fixture.debugElement.queryAll(By.css('button'));
    expect(dataElements.length).toEqual(1);
    expect(dataElements[0].nativeElement.innerText).toEqual('Component Name');
  });

  it('should render a label and chip data disabled', () => {
    fixture.componentRef.setInput('label', 'Route Title');
    fixture.componentRef.setInput('type', 'chip');
    fixture.componentRef.setInput('data', 'Lazy Component Name');
    fixture.detectChanges();

    const labelElement = fixture.debugElement.query(By.css('th'));
    expect(labelElement.nativeElement.innerText).toEqual('Route Title');

    const dataElements = fixture.debugElement.queryAll(By.css('button'));
    expect(dataElements.length).toEqual(1);
    expect(dataElements[0].nativeElement.innerText).toEqual('Lazy Component Name');
    expect(dataElements[0].nativeElement.disabled).toEqual(true);
  });

  it('should render a label and list data', () => {
    fixture.componentRef.setInput('label', 'Route Title');
    fixture.componentRef.setInput('type', 'list');
    fixture.componentRef.setInput('data', ['Guard 1', 'Guard 2']);
    fixture.detectChanges();

    const labelElement = fixture.debugElement.query(By.css('th'));
    expect(labelElement.nativeElement.innerText).toEqual('Route Title');

    const dataElements = fixture.debugElement.queryAll(By.css('button'));
    expect(dataElements.length).toEqual(2);
    expect(dataElements[0].nativeElement.innerText).toEqual('Guard 1');
    expect(dataElements[1].nativeElement.innerText).toEqual('Guard 2');
  });
});
