/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {ClickOutside} from './click-outside.directive';
import {By} from '@angular/platform-browser';

describe('ClickOutside', () => {
  let component: ExampleComponent;
  let fixture: ComponentFixture<ExampleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ExampleComponent, provideRouter([])],
    });
    fixture = TestBed.createComponent(ExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should docsClickOutside be emitted when user click outside `content` element', () => {
    const clickedOutsideSpy = spyOn(component, 'clickedOutside');
    const button = fixture.debugElement.query(By.css('button[id="exampleButton"]'));

    button.nativeElement.click();

    expect(clickedOutsideSpy).toHaveBeenCalledTimes(1);
  });

  it('should not docsClickOutside be emitted when user click inside `content` element', () => {
    const clickedOutsideSpy = spyOn(component, 'clickedOutside');
    const content = fixture.debugElement.query(By.css('div[id="content"]'));

    content.nativeElement.click();

    expect(clickedOutsideSpy).not.toHaveBeenCalled();
  });

  it('should not docsClickOutside be emitted when user click inside `content` element', () => {
    const clickedOutsideSpy = spyOn(component, 'clickedOutside');
    const button = fixture.debugElement.query(By.css('button[id="ignoreThisButton"]'));

    button.nativeElement.click();

    expect(clickedOutsideSpy).not.toHaveBeenCalled();
  });
});

@Component({
  template: `
    <div class="container">
      <button type="button" id="exampleButton">Click me</button>
      <button type="button" id="ignoreThisButton">Click me</button>
      <div
        id="content"
        (docsClickOutside)="clickedOutside()"
        [docsClickOutsideIgnore]="docsClickOutsideIgnore"
      >
        Content
      </div>
    </div>
  `,
  imports: [ClickOutside],
})
class ExampleComponent {
  docsClickOutsideIgnore = ['ignoreThisButton'];

  clickedOutside(): void {}
}
