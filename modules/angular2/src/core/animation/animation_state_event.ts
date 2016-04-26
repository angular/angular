export const ANY_STATE = '*';
export const EMPTY_STATE = 'void';
export class AnimationStateEvent {
  constructor(public id: string, public fromState: string, public toState: string) {}
}
