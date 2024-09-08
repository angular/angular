import {Component, Directive, EventEmitter, Input, Output} from '@angular/core';

@Directive({})
export class HostDir {
  @Input('valueAlias') value: number;
  @Input('colorAlias') color: string;
  @Output('openedAlias') opened = new EventEmitter();
  @Output('closedAlias') closed = new EventEmitter();
}

@Component({
    selector: 'my-component',
    template: '',
    hostDirectives: [{
            directive: HostDir,
            inputs: ['valueAlias', 'colorAlias: customColorAlias'],
            outputs: ['openedAlias', 'closedAlias: customClosedAlias'],
        }],
    standalone: false
})
export class MyComponent {
}
