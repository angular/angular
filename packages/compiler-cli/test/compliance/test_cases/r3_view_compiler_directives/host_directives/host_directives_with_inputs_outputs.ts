import {Component, Directive, EventEmitter, Input, Output} from '@angular/core';

@Directive({})
export class HostDir {
  @Input() value: number;
  @Input() color: string;
  @Output() opened = new EventEmitter();
  @Output() closed = new EventEmitter();
}

@Component({
    selector: 'my-component',
    template: '',
    hostDirectives: [{
            directive: HostDir,
            inputs: ['value', 'color: colorAlias'],
            outputs: ['opened', 'closed: closedAlias'],
        }],
    standalone: false
})
export class MyComponent {
}
