import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-app',
    template: `
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d"></div>
    <div attr.title="a{{one}}b{{two}}c"></div>
    <div attr.title="a{{one}}b"></div>
    <div attr.title="{{one}}"></div>
  `,
    standalone: false
})
export class MyComponent {
  name = 'John Doe';
  one!: any;
  two!: any;
  three!: any;
  four!: any;
  five!: any;
  six!: any;
  seven!: any;
  eight!: any;
  nine!: any;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
