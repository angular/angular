import { Pipe, OnDestroy, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sample',
  pure: false,
})
export class SamplePipe implements PipeTransform, OnDestroy {
  transform(val: any): void {
    return val;
  }

  ngOnDestroy(): void {
    console.log('Destroying');
  }
}
