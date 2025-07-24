import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n>
    Some content
    <div *ngIf="visible">
      Some other content {{ valueA }}
      <div>
        More nested levels with bindings {{ valueB | uppercase }}
        <div *ngIf="exists">
          Content inside sub-template {{ valueC }}
          <div>
            Bottom level element {{ valueD }}
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="!visible">
      Some other content {{ valueE + valueF }}
      <div>
        More nested levels with bindings {{ valueG | uppercase }}
      </div>
    </div>
  </div>
`,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}