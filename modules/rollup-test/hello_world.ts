import {Component} from "@igorminar/core";
import {bootstrap} from "@igorminar/platform-browser";

@Component({
  selector: 'hello-world',
  template: 'hello world!!!'
})
class HelloWorldComponent {

}

bootstrap(HelloWorldComponent);
