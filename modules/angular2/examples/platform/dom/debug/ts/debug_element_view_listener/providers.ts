import {Component} from 'angular2/core';
import {bootstrap, ELEMENT_PROBE_PROVIDERS} from 'angular2/platform/browser';

@Component({selector: 'my-component'})
class MyAppComponent {
}

// #docregion providers
bootstrap(MyAppComponent, [ELEMENT_PROBE_PROVIDERS]);
// #enddocregion