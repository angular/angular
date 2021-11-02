import {forwardRef, Injectable} from '@angular/core';

@Injectable({providedIn: 'root', useClass: forwardRef(() => SomeProviderImpl)})
abstract class SomeProvider {
}

@Injectable()
class SomeProviderImpl extends SomeProvider {
}
