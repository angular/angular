// tslint:disable

import {Input} from '@angular/core';

class Test {
  @Input() maxCellsPerRow = 5;

  private test(arr: string[]) {
    for (let i = 0; i < arr.length; i += this.maxCellsPerRow) {
      console.log(this.maxCellsPerRow);
    }
  }
}
