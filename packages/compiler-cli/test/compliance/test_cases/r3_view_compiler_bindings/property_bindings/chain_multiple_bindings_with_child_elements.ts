import {Component, Directive, Input, NgModule} from '@angular/core';

@Directive({
    selector: 'span',
    standalone: false
})
export class SpanDir {
  @Input() someProp!: any;
}

@Component({
    template: `
    <button [title]="myTitle" [id]="buttonId" [tabindex]="1">
      <span [id]="1" [title]="'hello'" [someProp]="1 + 2"></span>
    </button>`,
    standalone: false
})
export class MyComponent {
  myTitle = 'hello';
  buttonId = 'special-button';
}

@NgModule({declarations: [MyComponent, SpanDir]})
export class MyMod {
}
