import {Component} from '@angular/core';

import {HelloWorldComponent} from './hello-world/hello-world.component';
import {HelloWorldTemplateComponent} from './hello-world-template.component';
import {HelloWorldNgIfComponent} from './hello-world-ngif/hello-world-ngif.component';
import {HelloWorldDependencyInjectionComponent} from './hello-world-di/hello-world-di.component';
import {HelloWorldInterpolationComponent} from './hello-world-interpolation/hello-world-interpolation.component';
import {HelloWorldBindingsComponent} from './hello-world-bindings/hello-world-bindings.component';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    HelloWorldComponent,
    HelloWorldTemplateComponent,
    HelloWorldNgIfComponent,
    HelloWorldDependencyInjectionComponent,
    HelloWorldInterpolationComponent,
    HelloWorldBindingsComponent,
  ],
})
export class AppComponent {}
