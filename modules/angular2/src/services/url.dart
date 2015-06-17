library angular2.services.url;

// TODO(vicb): move this to its own module - will be stripped by trsfs
import 'dart:mirrors';

enum baseUrl {
  here
}

String getComponentBaseUrl(Type component)=>
    (reflectClass(component).owner as LibraryMirror).uri.toString();
