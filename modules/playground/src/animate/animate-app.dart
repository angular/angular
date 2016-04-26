import 'package:angular2/core.dart' show Component;
import 'package:angular2/animate.dart' show
  AnimationEntryMetadata,
  AnimationStyleMetadata,
  AnimationAnimateMetadata,
  AnimationSequenceMetadata,
  AnimationGroupMetadata;

@Component(
  selector: 'animate-app',
  styleUrls: const ['css/animate-app.css'],
  templateUrl: './animate-app.html',
  animations: const [
    const AnimationEntryMetadata("boxAnimation(void => start)", const AnimationSequenceMetadata(const [
      const AnimationStyleMetadata(const {"height": 0, "opacity": 0}),
      const AnimationStyleMetadata(const {"background": "gold"}),
      const AnimationAnimateMetadata(const [const {"height": 100, "opacity": 1, "background":"red"}], 500)
    ])),
    const AnimationEntryMetadata("boxAnimation(start => active)", const AnimationSequenceMetadata(const [
      const AnimationStyleMetadata(const {"background": "red"}),
      const AnimationAnimateMetadata(const [const {"background": "green"}], 1000)
    ])),
    const AnimationEntryMetadata("boxAnimation(active => start)", const AnimationSequenceMetadata(const [
      const AnimationStyleMetadata(const {"background": "green"}),
      const AnimationAnimateMetadata(const [const {"background": "red"}], 1000)
    ])),
    const AnimationEntryMetadata("boxAnimation(* => void)", const AnimationSequenceMetadata(const [
      const AnimationStyleMetadata(const {"height": 100, "opacity": 1}),
      const AnimationAnimateMetadata(const [const {"height": 0, "opacity": 0}], 500)
    ]))
  ]
)
class AnimateApp {
  bool _visible = false;
  var items = [];

  bool get visible => this._visible;
  set visible(bool) {
    this._visible = bool;
    if (this._visible) {
      this.items = [
        1,2,3,4,5,
        6,7,8,9,10,
        11,12,13,14,15,
        16,17,18,19,20
      ];
    } else {
      this.items = [];
    }
  }
}
