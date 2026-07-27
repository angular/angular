import {Component, Directive} from '@angular/core';

@Directive({selector: '[forceFull]'})
export class ForceFull {}

@Component({
  selector: 'manifest-dom-properties',
  template: `
    <my-button
      [readonly]="readonly"
      [(formaction)]="formaction"
      [innerHTML]="html"
      [tabindex]="tabindex"
    ></my-button>
  `,
})
export class ManifestDomProperties {
  readonly = false;
  formaction = '/submit';
  html = '<strong>content</strong>';
  tabindex = 0;
}

@Component({
  selector: 'manifest-properties',
  imports: [ForceFull],
  template: `
    <my-button
      forceFull
      [readonly]="readonly"
      [(formaction)]="formaction"
      [innerHTML]="html"
    ></my-button>
  `,
})
export class ManifestProperties {
  readonly = false;
  formaction = '/submit';
  html = '<strong>content</strong>';
}

@Component({
  selector: 'manifest-dom-property-shapes',
  template: `
    <my-button [readonly]="readonly" />
    <input [readonly]="readonly" />
    @if (readonly) {
      <my-button [readonly]="readonly" [innerHTML]="html" />
    }
    <my-button innerHTML="{{html}}" />
  `,
})
export class ManifestDomPropertyShapes {
  readonly = false;
  html = '<strong>content</strong>';
}

@Component({
  selector: 'manifest-property-shapes',
  imports: [ForceFull],
  template: `
    <my-button forceFull [readonly]="readonly" [innerHTML]="html" />
    <input forceFull [readonly]="readonly" />
    @if (readonly) {
      <my-button forceFull innerHTML="{{html}}" />
    }
  `,
})
export class ManifestPropertyShapes {
  readonly = false;
  html = '<strong>content</strong>';
}
