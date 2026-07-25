import {Component} from '@angular/core';

@Component({
    template: `
    @defer (on timer(500ms); loaded onDeferredLoaded()) {Deferred content} @placeholder {Placeholder}
  `,
    standalone: false
})
export class MyApp {
  onDeferredLoaded() {}
}
