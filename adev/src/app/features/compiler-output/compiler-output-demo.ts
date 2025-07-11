import {CdkMenuModule} from '@angular/cdk/menu';
import {Component, HostListener, inject, resource, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {compileFormatAndHighlight} from './compile';
import {formatAngularTemplate} from './prettier';
import {Template, templates} from './templates';
import {unzip, zip} from './zip';
import {DomSanitizer} from '@angular/platform-browser';
import {IconComponent} from '@angular/docs';

@Component({
  imports: [FormsModule, CdkMenuModule, IconComponent],
  styleUrl: './compiler-output-demo.scss',
  template: `
  <div class="page docs-viewer">
    <h1>Angular Template Compiler output</h1>
    <main>
      <section>
        <div class="controls">
          <h2>Template</h2>

          <div class="adev-playground-header">
            <div class="adev-template-select">
              <label for="playgroundTemplate">Select a template</label>
              <button [cdkMenuTriggerFor]="templatesMenu">
                <span>{{ currentTemplate() }}</span>

                <docs-icon>arrow_drop_down</docs-icon>
              </button>
            </div>
          </div>

          <ng-template #templatesMenu>
            <ul class="adev-template-dropdown" cdkMenu>
              @for (template of templates; track $index) {
                <li>
                  <button
                    cdkMenuItem
                    type="button"
                    (click)="selectTemplate(template)"
                  >
                    <span>{{ template.label }}</span>
                  </button>
                </li>
              }
            </ul>
          </ng-template>

          <button
            class="docs-primary-btn"
            [attr.text]="'Prettify ✨'"
            (click)="pretty()"
          >
            Prettify
          </button>
          <button
            class="docs-primary-btn"
            [attr.text]="'Share Example'"
            (click)="save()"
          >
            Share example
          </button>
        </div>
        <textarea
          cols="80"
          rows="12"
          [(ngModel)]="template"
          (keydown)="selectCustom()"
        ></textarea>
      </section>
      <hr />
      <h2>The compiled template</h2>
      @if (errors().length > 0) {
        <section class="error">
          @for (error of errors(); track error) {
            <div>L{{ error.line }}: {{ error.message }}</div>
          }
        </section>
      }
      <pre><code [innerHTML]="compiledTemplate.value()?.output"></code></pre>
      <code>renderFlag: 1=Creation Mode, 2=Update Mode</code>

      <hr />

      <h2>About this example</h2>
      <p>
        The output is the result of the Angular Template Compiler, which
        compiles the template into in javascript instructions that can then used by the Angular
        framework.
      </p>
    </main>
    </div>
  `,
})
export default class CompilerOutputDemo {
  protected readonly router = inject(Router);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sanitzer = inject(DomSanitizer);

  protected readonly templates = templates;
  protected readonly template = signal(templates[0].content);
  protected readonly errors = signal<{message: string; line: number}[]>([]);
  protected readonly currentTemplate = signal(templates[0].label);

  protected readonly compiledTemplate = resource({
    params: this.template,
    loader: async ({params: template}) => await this.compileTemplate(template),
  });

  constructor() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params['template']) {
        this.selectCustom();
        this.template.set(unzip(params['template']));
      }
    });
  }

  selectTemplate(template: Template): void {
    this.template.set(template.content);
    this.currentTemplate.set(template.label);
  }

  selectCustom() {
    this.currentTemplate.set('Custom');
  }

  async compileTemplate(template: string) {
    const {output, errors} = await compileFormatAndHighlight(template);
    this.errors.set(
      errors?.map((e) => {
        return {message: e.msg, line: e.span.start.line};
      }) ?? [],
    );

    // the output contains inline styles, so we need to trust it
    return {output: this.sanitzer.bypassSecurityTrustHtml(output), errors};
  }

  async pretty() {
    const newTemplateStr = await formatAngularTemplate(this.template());
    this.template.set(newTemplateStr);
  }

  save() {
    this.router.navigate([], {
      queryParams: {template: zip(this.template())},
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 's' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      this.save();
    }
  }
}
