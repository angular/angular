library angular2.core.compiler.pipe_lifecycle_reflector;

import 'package:angular2/src/core/linker/interfaces.dart';

bool implementsOnDestroy(Object pipe) => pipe is OnDestroy;
