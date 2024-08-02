import {Component} from '@angular/core';

@Component({
  template: `<img ngLocalSrc="path/to/my/file-with-size.jpg" [width]="width" height="200"/>`,
})
export class MyApp {
  width = 400;
}
