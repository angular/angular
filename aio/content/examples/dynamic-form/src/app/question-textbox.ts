// #docregion
import { QuestionBase } from './question-base';

export class TextboxQuestion extends QuestionBase<string> {
  override controlType = 'textbox';
}
