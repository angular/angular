/* tslint:disable component-selector */
import { Component, AfterViewInit, ViewChild, Input, ViewChildren, QueryList, OnInit } from '@angular/core';
import { CodeComponent } from './code.component';

export interface TabInfo {
  class: string|null;
  code: string;
  language: string|null;
  linenums: any;
  path: string;
  region: string;
  title: string|null;
}

/**
 * Renders a set of tab group of code snippets.
 *
 * The innerHTML of the `<code-tabs>` component should contain `<code-pane>` elements.
 * Each `<code-pane>` has the same interface as the embedded `<code-example>` component.
 * The optional `linenums` attribute is the default `linenums` for each code pane.
 */
@Component({
  selector: 'code-tabs',
  template: `
    <!-- Use content projection so that the provided HTML's code-panes can be split into tabs -->
    <div #content style="display: none"><ng-content></ng-content></div>

    <mat-card>
      <mat-tab-group class="code-tab-group" disableRipple>
        <mat-tab style="overflow-y: hidden;" *ngFor="let tab of tabs">
          <ng-template mat-tab-label>
            <span class="{{ tab.class }}">{{ tab.title }}</span>
          </ng-template>
          <aio-code class="{{ tab.class }}"
                    [language]="tab.language"
                    [linenums]="tab.linenums"
                    [path]="tab.path"
                    [region]="tab.region"
                    [title]="tab.title">
          </aio-code>
        </mat-tab>
      </mat-tab-group>
    </mat-card>
  `,
})
export class CodeTabsComponent implements OnInit, AfterViewInit {
  tabs: TabInfo[];

  @Input('linenums') linenums: string;

  @ViewChild('content') content;

  @ViewChildren(CodeComponent) codeComponents: QueryList<CodeComponent>;

  ngOnInit() {
    this.tabs = [];
    const codeExamples = this.content.nativeElement.querySelectorAll('code-pane');

    for (let i = 0; i < codeExamples.length; i++) {
      const tabContent = codeExamples[i];
      this.tabs.push(this.getTabInfo(tabContent));
    }
  }

  ngAfterViewInit() {
    this.codeComponents.toArray().forEach((codeComponent, i) => {
      codeComponent.code = this.tabs[i].code;
    });
  }

  /** Gets the extracted TabInfo data from the provided code-pane element. */
  private getTabInfo(tabContent: HTMLElement): TabInfo {
    return {
      class: tabContent.getAttribute('class'),
      code: tabContent.innerHTML,
      language: tabContent.getAttribute('language'),
      linenums: tabContent.getAttribute('linenums') || this.linenums,
      path: tabContent.getAttribute('path') || '',
      region: tabContent.getAttribute('region') || '',
      title: tabContent.getAttribute('title')
    };
  }
}
