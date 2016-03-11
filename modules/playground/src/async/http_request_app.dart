import 'package:angular2/html.dart';

import 'package:angular2/angular2.dart' show Component;

@Component(
  selector: 'http-request-app',
  template: '''
    <span class='val'>{{val}}</span>
    <button class='action' (click)="httpRequest()">Http Request</button>''')
class HttpRequestApp {
  String val = 'placeholder';

  ScrollAreaComponent() {
  }
  
  httpRequest() {
    HttpRequest.getString('slowslowslowdata.json')
        .then((String fileContents) {
          this.val = fileContents;
        });
      }
}
