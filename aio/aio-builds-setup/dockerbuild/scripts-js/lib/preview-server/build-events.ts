// Classes
export class ChangedPrVisibilityEvent {
  // Properties - Public, Static
  public static type = 'pr.changedVisibility';

  // Constructor
  constructor(public pr: number, public shas: string[], public isPublic: boolean) {}
}

export class CreatedBuildEvent {
  // Properties - Public, Static
  public static type = 'build.created';

  // Constructor
  constructor(public pr: number, public sha: string, public isPublic: boolean) {}
}
