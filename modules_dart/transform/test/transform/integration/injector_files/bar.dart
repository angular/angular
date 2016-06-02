library bar;

import 'package:angular2/src/core/metadata.dart';
import 'foo.dart';

@Injectable()
class ServiceDep {
}

@InjectorModule(providers: const [ServiceDep])
class MyModule {}
