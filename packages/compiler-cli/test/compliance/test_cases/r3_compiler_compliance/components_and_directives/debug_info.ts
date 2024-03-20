import {Component} from '@angular/core';

@Component({
  template: 'Hello Angular!',
})
export class Main {
}

@Component({
  standalone: true,
  template: 'Hello Angular!',
})
export class MainStandalone {
}
