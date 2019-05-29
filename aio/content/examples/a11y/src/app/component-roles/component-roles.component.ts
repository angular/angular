import { Component } from '@angular/core';

@Component({
  selector: 'app-component-roles',
  templateUrl: './component-roles.component.html',
})
export class ComponentRolesComponent {
  inputDivModel = '';
  buttonClicks = 0;

  onClick(): void {
    this.buttonClicks++;
  }

  generateButtonString(): string {
    return `Button has been clicked ${this.buttonClicks} times`;
  }

}
