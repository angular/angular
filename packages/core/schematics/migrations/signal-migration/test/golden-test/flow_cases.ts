// tslint:disable

import {Input} from '@angular/core';

class Test {
  @Input() maxCellsPerRow = 5;
  @Input() maxCellsPerRow2 = 5;

  private test(arr: string[]) {
    for (let i = 0; i < arr.length; i += this.maxCellsPerRow) {
      console.log(this.maxCellsPerRow);
    }
  }

  protected readonly test2 = this.maxCellsPerRow ? this.maxCellsPerRow === 3 : false;
  protected readonly test3 = this.maxCellsPerRow2 === 3 ? true : false;
}
