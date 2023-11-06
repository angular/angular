import {Component} from '@angular/core';
import {Logger} from '../logger.service';

@Component({
  standalone: true,
  selector: 'hello-world-di',
  templateUrl: './hello-world-di.component.html',
  providers: [Logger],
})
export class HelloWorldDependencyInjectionComponent {
  count = 0;

  constructor(private logger: Logger) {}

  onLogMe() {
    this.logger.writeCount(this.count);
    this.count++;
  }
}
