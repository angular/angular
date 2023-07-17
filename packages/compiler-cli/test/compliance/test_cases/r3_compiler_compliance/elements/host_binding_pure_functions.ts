import {Component, Input, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: '...',
  host: {
    '[@expansionHeight]': `{
        value: getExpandedState(),
        params: {
          collapsedHeight: collapsedHeight,
          expandedHeight: expandedHeight
        }
    }`,
    '[@expansionWidth]': `{
      value: getExpandedState(),
      params: {
        collapsedWidth: collapsedWidth,
        expandedWidth: expandedWidth
      }
    }`
  }
})
export class MyComponent {
  @Input() expandedHeight!: string;
  @Input() collapsedHeight!: string;

  @Input() expandedWidth!: string;
  @Input() collapsedWidth!: string;

  getExpandedState() {
    return 'expanded';
  }
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
