// Classes
export class CreatedBuildEvent {
  // Properties - Public, Static
  public static type = 'build.created';

  // Constructor
  constructor(public pr: number, public sha: string) {}
}
