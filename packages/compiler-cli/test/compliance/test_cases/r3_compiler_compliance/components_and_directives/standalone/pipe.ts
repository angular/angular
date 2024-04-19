import {Pipe} from '@angular/core';

@Pipe({
  standalone: true,
  name: 'stpipe',
})
export class StandalonePipe {
  transform(value: any): any {}
}
