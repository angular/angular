import {Component} from '@angular/core';


@Component({
  selector: 'checkbox-configurable-example',
  templateUrl: './checkbox-configurable-example.html',
  styleUrls: ['./checkbox-configurable-example.css'],
})
export class CheckboxConfigurableExample {
  checked = false;
  indeterminate = false;
  align = 'start';
  disabled = false;
}
