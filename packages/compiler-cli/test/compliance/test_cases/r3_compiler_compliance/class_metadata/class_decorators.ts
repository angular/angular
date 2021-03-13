import {Injectable} from '@angular/core';
import {CustomClassDecorator} from './custom';

@Injectable()
export class BasicInjectable {
}

@Injectable({providedIn: 'root'})
export class RootInjectable {
}

@Injectable()
@CustomClassDecorator()
class CustomInjectable {
}
