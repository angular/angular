import {Component} from '@angular/core';

@Component({
  template: `
    <div style.background="url({{ myUrl1 }})"
         style.borderImage="url({{ myUrl2 }}) {{ myRepeat }} auto"
         style.boxShadow="{{ myBoxX }} {{ myBoxY }} {{ myBoxWidth }} black"></div>
  `
})
export class MyComponent {
  myUrl1 = '...';
  myUrl2 = '...';
  myBoxX = '0px';
  myBoxY = '0px';
  myBoxWidth = '100px';
  myRepeat = 'no-repeat';
}
