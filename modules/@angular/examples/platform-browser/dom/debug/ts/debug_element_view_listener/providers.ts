import {Component} from '@angular/core';
import {ELEMENT_PROBE_PROVIDERS, bootstrap} from '@angular/platform-browser';

@Component({selector: 'my-component'})
class MyAppComponent {
}

// #docregion providers
bootstrap(MyAppComponent, [ELEMENT_PROBE_PROVIDERS]);
// #enddocregion
