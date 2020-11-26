import {Attribute, Component, Host, Injectable, NgModule, Optional, Self, SkipSelf} from '@angular/core';

@Injectable()
export class MyService {
}

@Component({selector: 'my-component', template: ``})
export class MyComponent {
  constructor(
      @Attribute('name') name: string,
      s1: MyService,
      @Host() s2: MyService,
      @Self() s4: MyService,
      @SkipSelf() s3: MyService,
      @Optional() s5: MyService,
      @Self() @Optional() s6: MyService,
  ) {}
}

@NgModule({declarations: [MyComponent], providers: [MyService]})
export class MyModule {
}
