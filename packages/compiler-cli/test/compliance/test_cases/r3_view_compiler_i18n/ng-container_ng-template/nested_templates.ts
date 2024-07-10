import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>
    <ng-template>
      Template A: {{ valueA | uppercase }}
      <ng-template>
        Template B: {{ valueB }}
        <ng-template>
          Template C: {{ valueC }}
        </ng-template>
      </ng-template>
    </ng-template>
  </div>
`,
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}