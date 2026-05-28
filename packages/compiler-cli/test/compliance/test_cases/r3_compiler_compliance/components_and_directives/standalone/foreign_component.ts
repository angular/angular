import {Component} from '@angular/core';

export function FancyButton() {}

// @angular/core does not expose the `ForeignComponent` type this should return. 
function frameworkImport(component: {}): Function {
  return () => {};
}

@Component({
  selector: 'main',
  template: `
    <FancyButton
      class="btn-cls"
      unsafe-attr="value"
      [label]="title"
      [unsafe-input]="title"
    />
  `,
  // @ts-ignore: @angular/core does not expose the `foreignImports` property.
  foreignImports: [
    // @ts-ignore: @angular/core does not expose the `ForeignComponent` type this expects.
    frameworkImport(FancyButton)
  ],
})
export class TestCmp {
  title = 'Submit';
}

@Component({
  selector: 'main-children',
  template: `
    <FancyButton [label]="title">
      @content(icon) {
        <span>Icon!</span>
      }
      @content(description) {
        <span>Description text</span>
      }
      <span>Other children</span>
    </FancyButton>
  `,
  // @ts-ignore: @angular/core does not expose the `foreignImports` property.
  foreignImports: [
    // @ts-ignore: @angular/core does not expose the `ForeignComponent` type this expects.
    frameworkImport(FancyButton)
  ],
})
export class TestCmpChildren {
  title = 'Submit';
}

