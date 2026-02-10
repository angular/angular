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
    fixture = TestBed.createComponent(RouteDetailsRowComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('label', 'Route Title');
    fixture.componentRef.setInput('data', {value: 'Route Data'});
    fixture.componentRef.setInput('dataKey', 'value');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a label and text data', async () => {
    fixture.componentRef.setInput('data', {value: 'Route Data'});
    fixture.componentRef.setInput('dataKey', 'value');
    await fixture.whenStable();

    const labelElement = fixture.debugElement.query(By.css('th'));
    expect(labelElement.nativeElement.innerText).toEqual('Route Title');

    const dataElements = fixture.debugElement.queryAll(By.css('td'));
    expect(dataElements.length).toEqual(1);
    expect(dataElements[0].nativeElement.innerText).toEqual('Route Data');
  });

  it('should render a label and flag data true', async () => {
    fixture.componentRef.setInput('type', 'flag');
    fixture.componentRef.setInput('data', {isActive: true});
    fixture.componentRef.setInput('dataKey', 'isActive');
    await fixture.whenStable();

    const labelElement = fixture.debugElement.query(By.css('th'));
    expect(labelElement.nativeElement.innerText).toEqual('Route Title');

    const dataElements = fixture.debugElement.queryAll(By.css('.tag-active'));
    expect(dataElements.length).toEqual(1);
    expect(dataElements[0].nativeElement.innerText).toEqual('true');
  });

  it('should render a label and flag data false', async () => {
    fixture.componentRef.setInput('type', 'flag');
    fixture.componentRef.setInput('data', {isLazy: false, isRedirect: false});
    fixture.componentRef.setInput('dataKey', 'isLazy');
    await fixture.whenStable();

    const labelElement = fixture.debugElement.query(By.css('th'));
    expect(labelElement.nativeElement.innerText).toEqual('Route Title');

    const dataElements = fixture.debugElement.queryAll(By.css('.tag-inactive'));
    expect(dataElements.length).toEqual(1);
    expect(dataElements[0].nativeElement.innerText).toEqual('false');
  });

  it('should render a label with an action button', async () => {
    fixture.componentRef.setInput('type', 'chip');
    fixture.componentRef.setInput('data', {name: 'Component Name'});
    fixture.componentRef.setInput('dataKey', 'name');
    fixture.componentRef.setInput('actionBtnType', 'view-source');
    await fixture.whenStable();

    const labelElement = fixture.debugElement.query(By.css('th'));
    expect(labelElement.nativeElement.innerText).toEqual('Route Title');

    const dataElements = fixture.debugElement.queryAll(By.css('button'));
    expect(dataElements.length).toEqual(1);
  });

  it('should render a label with a disabled action button', async () => {
    fixture.componentRef.setInput('type', 'chip');
    fixture.componentRef.setInput('data', {name: 'Lazy Component Name'});
    fixture.componentRef.setInput('dataKey', 'name');
    fixture.componentRef.setInput('actionBtnType', 'view-source');
    fixture.componentRef.setInput('actionBtnDisabled', true);
    await fixture.whenStable();

    const labelElement = fixture.debugElement.query(By.css('th'));
    expect(labelElement.nativeElement.innerText).toEqual('Route Title');

    const dataElements = fixture.debugElement.queryAll(By.css('button'));
    expect(dataElements.length).toEqual(1);
    expect(dataElements[0].nativeElement.disabled).toEqual(true);
  });

  it('should render a label and list data', async () => {
    fixture.componentRef.setInput('type', 'list');
    fixture.componentRef.setInput('data', {providers: ['Guard 1', 'Guard 2']});
    fixture.componentRef.setInput('dataKey', 'providers');
    fixture.componentRef.setInput('actionBtnType', 'view-source');
    await fixture.whenStable();

    const labelElement = fixture.debugElement.query(By.css('th'));
    expect(labelElement.nativeElement.innerText).toEqual('Route Title');

    const dataElements = fixture.debugElement.queryAll(By.css('button'));
    expect(dataElements.length).toEqual(2);
  });
});
