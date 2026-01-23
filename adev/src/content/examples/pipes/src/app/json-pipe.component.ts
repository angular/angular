import {Component} from '@angular/core';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-json-pipe',
  template: `{{ data | json }}`,
  imports: [JsonPipe],
})
export class JsonPipeComponent {
  data = {
    name: 'John Doe',
    age: 30,
    address: {
      street: '123 Main St',
      city: 'Anytown',
    },
  };
}
