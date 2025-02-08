import {Component} from '@angular/core';

@Component({
    selector: '[hostBindingDir]',
    host: {
        '[style.color]': '$any("red")',
    },
    template: ``,
    standalone: false
})
export class HostBindingDir {
}
