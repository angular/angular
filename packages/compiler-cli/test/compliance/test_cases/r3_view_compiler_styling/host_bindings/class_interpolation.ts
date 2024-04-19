import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <div class="A{{p1}}B"></div>
    <div class="A{{p1}}B{{p2}}C"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H{{p8}}I"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H{{p8}}I{{p9}}J"></div>
  `,
})
export class MyComponent {
  p1 = 100;
  p2 = 100;
  p3 = 100;
  p4 = 100;
  p5 = 100;
  p6 = 100;
  p7 = 100;
  p8 = 100;
  p9 = 100;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
