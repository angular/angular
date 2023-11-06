import {Attribute, Component} from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-my-input-with-attribute-decorator',
  template: '<p>The type of the input is: {{ type }}</p>',
})
export class MyInputWithAttributeDecoratorComponent {
  constructor(@Attribute('type') public type: string) {}
}
