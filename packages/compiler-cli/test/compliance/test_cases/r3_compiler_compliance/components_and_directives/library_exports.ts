// This test verifies that a directive from an external library is emitted using its declared name,
// even in the presence of alias exports that could have been chosen.
// See https://github.com/angular/angular/issues/41277.
import {Component, NgModule} from '@angular/core';
import {LibModule} from 'external_library';

@Component({
    template: `
    <lib-dir></lib-dir>
  `,
    standalone: false
})
export class TestComponent {
}

@NgModule({
  declarations: [TestComponent],
  imports: [LibModule],
})
export class TestModule {
}
