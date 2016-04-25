import {Component} from '@angular/core';
import {bootstrap, ELEMENT_PROBE_PROVIDERS} from '@angular/platform-browser';

@Component({selector: 'my-component'})
class MyAppComponent {
}

// #docregion providers
bootstrap(MyAppComponent, [ELEMENT_PROBE_PROVIDERS]);
// #enddocregion
