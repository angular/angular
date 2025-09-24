import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'lib-post',
  template: '{{random}}',
})
export class PostComponent {
  random = Math.random();
}

@NgModule({
  declarations: [PostComponent],
  exports: [PostComponent],
})
export class PostModule {}
