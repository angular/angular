declare module jasmine {
  interface Matchers {
    toExistAsAFile(remove = true): boolean;
    toExistAsABuild(remove = true): boolean;
    toExistAsAnArtifact(remove = true): boolean;
  }
}