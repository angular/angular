// #docregion
import { QuestionBase } from './question-base';

export class TextboxQuestion extends QuestionBase<string> {
  override controlType = 'textbox';
  override type: string = this.type !== '' ? this.type : 'text';
}
