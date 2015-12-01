library angular2.core.compiler.pipe_lifecycle_reflector;

import 'package:angular2/src/core/change_detection/pipe_transform.dart';

bool implementsOnDestroy(Object pipe) => pipe is PipeOnDestroy;
