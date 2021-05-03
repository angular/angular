import {Component, NgModule} from '@angular/core';
import {ForOfDirective} from './for_of';

@Component({
  selector: 'my-component',
  template: `
  <ul>
    <li *for="let item of items">
      <div>{{item.name}}</div>
      <ul>
        <li *for="let info of item.infos">
          {{item.name}}: {{info.description}}
        </li>
      </ul>
    </li>
  </ul>`
})
export class MyComponent {
  items = [
    {name: 'one', infos: [{description: '11'}, {description: '12'}]},
    {name: 'two', infos: [{description: '21'}, {description: '22'}]}
  ];
}

@NgModule({declarations: [MyComponent, ForOfDirective]})
export class MyModule {
}
