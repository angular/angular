import {Pipe, PipeTransform} from '@angular/core';

// TODO(crisbeto): remove `null!` from the pipes when public API is updated.
@Pipe(null!)
export class PipeWithoutName implements PipeTransform {
  transform(value: unknown) {
    return value;
  }
}
