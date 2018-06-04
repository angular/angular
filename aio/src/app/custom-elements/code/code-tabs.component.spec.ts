import { Component, ViewChild, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Logger } from 'app/shared/logger.service';
import { MockLogger } from 'testing/logger.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CodeTabsComponent } from './code-tabs.component';
import { CodeTabsModule } from './code-tabs.module';

describe('CodeTabsComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let hostComponent: HostComponent;
  let codeTabsComponent: CodeTabsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ HostComponent ],
      imports: [ CodeTabsModule, NoopAnimationsModule ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
       { provide: Logger, useClass: MockLogger },
      ]
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    codeTabsComponent = hostComponent.codeTabsComponent;

    fixture.detectChanges();
  });

  it('should get correct tab info', () => {
    const tabs = codeTabsComponent.tabs;
    expect(tabs.length).toBe(2);

    // First code pane expectations
    expect(tabs[0].class).toBe('class-A');
    expect(tabs[0].language).toBe('language-A');
    expect(tabs[0].linenums).toBe('linenums-A');
    expect(tabs[0].path).toBe('path-A');
    expect(tabs[0].region).toBe('region-A');
    expect(tabs[0].title).toBe('title-A');
    expect(tabs[0].code.trim()).toBe('Code example 1');

    // Second code pane expectations
    expect(tabs[1].class).toBe('class-B');
    expect(tabs[1].language).toBe('language-B');
    expect(tabs[1].linenums).toBe('default-linenums', 'Default linenums should have been used');
    expect(tabs[1].path).toBe('path-B');
    expect(tabs[1].region).toBe('region-B');
    expect(tabs[1].title).toBe('title-B');
    expect(tabs[1].code.trim()).toBe('Code example 2');
  });

  it('should create the right number of tabs with the right labels and classes', () => {
    const matTabs = fixture.nativeElement.querySelectorAll('.mat-tab-label');
    expect(matTabs.length).toBe(2);

    expect(matTabs[0].textContent.trim()).toBe('title-A');
    expect(matTabs[0].querySelector('.class-A')).toBeTruthy();

    expect(matTabs[1].textContent.trim()).toBe('title-B');
    expect(matTabs[1].querySelector('.class-B')).toBeTruthy();
  });

  it('should show the first tab with the right code', () => {
    const codeContent = fixture.nativeElement.querySelector('aio-code').textContent;
    expect(codeContent.indexOf('Code example 1') !== -1).toBeTruthy();
  });
});

@Component({
  selector: 'aio-host-comp',
  template: `
    <code-tabs linenums="default-linenums">
      <code-pane class="class-A"
                 language="language-A"
                 linenums="linenums-A"
                 path="path-A"
                 region="region-A"
                 title="title-A">
        Code example 1
      </code-pane>
      <code-pane class="class-B"
                 language="language-B"
                 path="path-B"
                 region="region-B"
                 title="title-B">
        Code example 2
      </code-pane>
    </code-tabs>
  `
})
class HostComponent {
  @ViewChild(CodeTabsComponent) codeTabsComponent: CodeTabsComponent;
}
