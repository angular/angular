library dinner.soup;

import 'package:angular2/metadata.dart';

@Component(selector: '[soup]')
class MultiSoupComponent implements OnChange, OnDestroy, OnInit {}

@Component(selector: '[soup]', lifecycle: const [LifecycleEvent.onCheck])
class MixedSoupComponent implements OnChange {}

@Component(selector: '[soup]', lifecycle: const [LifecycleEvent.onChange])
class MatchedSoupComponent implements OnChange {}
