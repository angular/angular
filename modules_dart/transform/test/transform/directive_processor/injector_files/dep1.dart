library angular2.test.transform.directive_processor.injector_files.dep1;

import 'package:angular2/angular2.dart'
    show Injectable;

@Injectable()
class ServiceDep {
  const ServiceDep();
  static someFactory() {}
}
