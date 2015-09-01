library dinner.soup;

import 'package:angular2/metadata.dart';

@Component(selector: '[soup]')
class MultiSoupComponent implements OnChanges, OnDestroy, OnInit {}

@Component(selector: '[soup]', lifecycle: const [LifecycleEvent.DoCheck])
class MixedSoupComponent implements OnChanges {}

@Component(selector: '[soup]', lifecycle: const [LifecycleEvent.OnChanges])
class MatchedSoupComponent implements OnChanges {}
