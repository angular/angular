library angular2.src.core.change_detection.pipes;

import "pipe_transform.dart" show PipeTransform;

abstract class Pipes {
  SelectedPipe get(String name);
}

class SelectedPipe {
  PipeTransform pipe;
  bool pure;
  SelectedPipe(this.pipe, this.pure) {}
}
