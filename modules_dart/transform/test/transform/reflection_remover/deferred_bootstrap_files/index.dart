import 'package:angular2/bootstrap.dart' deferred as ng;

void main() {
  ng.loadLibrary().then((_) {
    ng.bootstrap(MyComponent);
  });
}
