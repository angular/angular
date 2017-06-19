import { Component, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { HelperService } from '../services/helper.service';

// #docregion
const noop = () => {
};

const A11Y_CUSTOM_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CustomControlComponent),
    multi: true
  };

@Component({
  selector: 'app-custom-control',
  templateUrl: './custom-control.component.html',
  styleUrls: ['./custom-control.component.css'],
  providers: [A11Y_CUSTOM_CONTROL_VALUE_ACCESSOR]
})
export class CustomControlComponent implements OnInit, ControlValueAccessor {
  uniqueId: string;

  private innerValue = '';
  outerValue = '';

  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;

  constructor(private a11yHelper: HelperService) {
  }

  onChange(event: any, value: string): void {
    if (event.keyCode === 13) {
      event.preventDefault();
    } else {
      this.innerValue = this.a11yHelper.removeHtmlStringBreaks(value);
      this.onChangeCallback(this.innerValue);
    }
  }

  onBlur(): void {
    this.onTouchedCallback();
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      this.outerValue = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  ngOnInit(): void {
    this.uniqueId = this.a11yHelper.generateUniqueIdString();
  }

}
// #enddocregion
