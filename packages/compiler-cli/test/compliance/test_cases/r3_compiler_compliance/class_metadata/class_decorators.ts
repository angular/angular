import {Component, Injectable} from '@angular/core';

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

@Component({
    selector: 'test-cmp',
    templateUrl: 'test_cmp_template.html',
})
export class ComponentWithExternalResource {
}
