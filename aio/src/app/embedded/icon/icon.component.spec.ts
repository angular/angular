import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IconComponent, HostComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // IconComponent contains `mat-icon` elements
    });
    fixture = TestBed.createComponent(HostComponent);
  });

  it('should render a Material icon component', () => {
    fixture.detectChanges();
    const iconComponent = fixture.debugElement.query(By.css('mat-icon'));
    expect(iconComponent.properties['svgIcon']).toBe('abc');
  });
});

// Helper class
@Component({
  template: `<aio-icon name="abc"></aio-icon>`
})
class HostComponent { }
