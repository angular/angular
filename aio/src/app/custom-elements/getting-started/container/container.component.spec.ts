import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerComponent } from './container.component';

@Component({
  template: `
    <aio-gs-container>
      <ng-container class="template">Template</ng-container>
      <ng-container class="data">Data</ng-container>
      <ng-container class="result">Result</ng-container>
    </aio-gs-container>
  `
})
export class TestComponent {}

describe('Getting Started Container Component', () => {
  let fixture: ComponentFixture<ContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ContainerComponent, TestComponent ]
    });

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should project the content into the appropriate areas', () => {
    const compiled = fixture.debugElement.nativeElement;
    const pre = compiled.querySelector('pre');
    const code = compiled.querySelector('code');
    const tabledata = compiled.querySelectorAll('td');

    expect(pre.textContent).toContain('Template');
    expect(code.textContent).toContain('Data');
    expect(tabledata[2].textContent).toContain('Result');
  });
});
