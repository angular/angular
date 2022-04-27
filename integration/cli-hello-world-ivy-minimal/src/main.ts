// This is a minimal ivy app that is meant to mimic the bazel equivalent
// in `packages/core/test/bundling/hello_world`, and should be kept similar.

import { ɵrenderComponent as renderComponent } from '@angular/core';
import { AppComponent } from './app/app.component.js';
import './environments/environment.js';
renderComponent(AppComponent);
