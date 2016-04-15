import 'package:angular2/core.dart' show Component;

@Component(
  selector: 'animate-app',
  styleUrls: const ['css/animate-app.css'],
  templateUrl: './animate-app.html',
  animations: const [
    // todo
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
