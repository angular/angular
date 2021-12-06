import {Component} from '@angular/core';

@Component({
  template: `
    <span [title]="person?.getName(false)"></span>
    <span [title]="person?.getName(false) || ''"></span>
    <span [title]="person?.getName(false)?.toLowerCase()"></span>
    <span [title]="person?.getName(config.get('title')?.enabled)"></span>
    <span [title]="person?.getName(config.get('title')?.enabled ?? true)"></span>
`
})
export class MyApp {
  person?: {getName: (includeTitle: boolean|undefined) => string;};
  config: {
    get:
        (name: string) => {
          enabled: boolean
        } |
        undefined;
  }
}
