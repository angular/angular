import {Component, Directive, Input} from '@angular/core';

// Fake NgOptimizedImage so we don't pull @angular/common
@Directive({selector: 'img', standalone: true})
export class NgOptimizedImage {
  @Input() ngSrc:string;
}

@Component({
  standalone: true,
  imports: [NgOptimizedImage],
  template: `<img [ngSrc]="imagePath" width="100" height="100"/>`,
})
export class MyApp {
  imagePath = 'foo/bar'
}
