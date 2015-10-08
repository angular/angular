library angular2.core;

// Public Core API
export 'package:angular2/src/core/metadata.dart';
export 'package:angular2/src/core/util.dart';
export 'package:angular2/src/core/di.dart';
export 'package:angular2/src/core/pipes.dart';
export 'package:angular2/src/core/facade.dart';
// Do not export application for dart. Must import from angular2/bootstrap
//export 'package:angular2/src/core/application.dart';
export 'package:angular2/src/core/application_ref.dart' hide ApplicationRef_, PlatformRef_;
export 'package:angular2/src/core/services.dart';
export 'package:angular2/src/core/linker.dart';
export 'package:angular2/src/core/lifecycle.dart';
export 'package:angular2/src/core/zone.dart';
export 'package:angular2/src/core/render.dart';
export 'package:angular2/src/core/directives.dart';
export 'package:angular2/src/core/forms.dart';
export 'package:angular2/src/core/debug.dart';
export 'package:angular2/src/core/change_detection.dart';
