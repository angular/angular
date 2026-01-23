import {Directive} from '@angular/core';

@Directive({
  selector: '[hostBindingDir]',
  host: {'[style.background-image]': 'imgUrl', '[style]': 'styles'},
})
export class HostBindingDir {
  imgUrl = 'url(foo.jpg)';
  styles = {backgroundImage: this.imgUrl};
}
