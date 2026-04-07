// tslint:disable

import {Input} from '@angular/core';

export class TestMigrationComponent {
  @Input() public model: any;

  public onSaveClick(): void {
    this.model.requisitionId = 145;
    this.model.comment = 'value';
  }
}
