import {Component} from '@angular/core';

@Component({
    template: 'Hello Angular!',
    standalone: false
})
export class Main {
}

@Component({
    template: 'Hello Angular!'
})
export class MainStandalone {
}
