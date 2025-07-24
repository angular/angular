import {Component} from '@angular/core';

@Component({
    template: `<div
                    style.color="a{{one}}b"
                    style.border="a{{one}}b"
                    [class.apple]="yesToApple"
                    [style.transition]="transition"
                    [class.orange]="yesToOrange"
                    [style.width]="width"
                    style.height="a{{one}}b"
                    style.top="a{{one}}b"></div>`,
    standalone: false
})
export class MyComponent {
  one = '';
  transition = 'all 1337ms ease';
  width = '42px';
  yesToApple = true;
  yesToOrange = true;
}
