// tslint:disable

import {Input} from '@angular/core';

class MyComp {
  @Input() myInput = () => {};
}

spyOn<MyComp>(new MyComp(), 'myInput').and.returnValue();
