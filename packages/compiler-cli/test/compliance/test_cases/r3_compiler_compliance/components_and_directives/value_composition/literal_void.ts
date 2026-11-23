import {Component} from '@angular/core';

@Component({
  template: `
    @let array = [void 0, 1];
    @let object = {a: void 0, b: 2};

    <!-- Use the literals so they don't get flagged as unused. -->
    {{array}} {{object}}
  `,
})
export class VoidComp {}
