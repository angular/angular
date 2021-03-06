import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'static-styling',
  template: `
    <div *ngIf="exp" class="foo bar baz" style="margin: 0px; background: url('img.png');"></div>
  `,
})
export class StaticStyling {
  exp = true;
}

@Component({
  selector: 'styling-bindings',
  template: `
    <div *ngIf="exp" [class.red]="classExp" [style.margin]="styleExp"></div>
  `,
})
export class StyleBindings {
  classExp = true;
  styleExp = '10px';
}

@Component({
  selector: 'styling-map-bindings',
  template: `
    <div *ngIf="exp" [class]="classExp" [style]="styleExp"></div>
  `,
})
export class StyleMapBindings {
  classExp = {red: true};
  styleExp = {margin: '10px'};
}

@NgModule({
  declarations: [
    StaticStyling,
    StyleBindings,
    StyleMapBindings,
  ]
})
export class MyModule {
}
