import {Pipe} from '@angular/core';

@Pipe({
  name: 'stpipe',
})
export class StandalonePipe {
  transform(value: any): any {}
}
