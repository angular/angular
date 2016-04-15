import 'package:angular2/core.dart' show Component;
import 'package:angular2/animate.dart' show AnimationStyleMetadata, AnimationAnimateMetadata, AnimationSequenceMetadata, AnimationGroupMetadata;

@Component(
  selector: 'animate-app',
  styleUrls: const ['css/animate-app.css'],
  templateUrl: './animate-app.html',
  animations: const {
    "ngEnter": const [
      const AnimateStyleMetadata(const {"height": 0, "opacity": 0}),
      const AnimateStyleMetadata(const {"background": "gold"}),
      const AnimateGroupMetadata(const [
        const AnimateAnimateMetadata(const {"height": 100, "opacity": 1}, 500),
        const AnimateAnimateMetadata(const {"background": "red"}, "2s")
      ]),
      const AnimateAnimateMetadata(const {"background": "white"}, "500ms")
    ],
    "ngLeave": const AnimateSequenceMetadata(const [
      const AnimateStyleMetadata(const {"opacity": 1, "width": "200px"}),
      const AnimateStyleMetadata(const {"background": "white"}),
      const AnimateStyleMetadata(const {"background": "blue", "opacity": 0, "width": 0}, "1000ms ease-out")
    ])
  }
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
