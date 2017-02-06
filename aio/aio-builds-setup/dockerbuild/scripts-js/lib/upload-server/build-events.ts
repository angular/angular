// Classes
export class BuildEvent {
  // Constructor
  constructor(public type: string, public pr: number, public sha: string) {}
}

export class CreatedBuildEvent extends BuildEvent {
  // Properties - Public, Static
  public static type = 'build.created';

  // Constructor
  constructor(pr: number, sha: string) {
    super(CreatedBuildEvent.type, pr, sha);
  }
}
