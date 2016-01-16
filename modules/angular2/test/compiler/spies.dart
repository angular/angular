library compiler.spies;

import 'package:angular2/src/compiler/xhr.dart';
import 'package:angular2/testing_internal.dart';
import 'package:angular2/src/compiler/template_compiler.dart';

@proxy
class SpyXHR extends SpyObject implements XHR {}

@proxy
class SpyTemplateCompiler extends SpyObject implements TemplateCompiler {}
