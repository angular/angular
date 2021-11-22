import { ApplicationEnvironment, Environment } from 'ng-devtools';
import { environment } from '../environments/environment';

export class ChromeApplicationEnvironment extends ApplicationEnvironment {
  get environment(): Environment {
    return environment;
  }
}
