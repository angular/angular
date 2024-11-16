import {Component} from '@angular/core';

@Component({
    template: `
    <div i18n>
      Content:
      @switch (count) {
        @case (0) {before<span>zero</span>after}
        @case (1) {before<div>one</div>after}
        @default {before<button>otherwise</button>after}
      }
    </div>
  `,
    standalone: false
})
export class MyApp {
  count = 0;
}
