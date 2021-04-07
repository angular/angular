import {SemVer} from 'semver';


export enum TaskResult {
  Failure,
  Success
}


export abstract class Task<R extends unknown, P extends unknown[]> {
  private stagingOutput: R|undefined;


  /** @internal */
  protected abstract _stage(...args: P): Promise<R>;
  /** @internal */
  protected abstract _execute(stagingOutput: R): Promise<TaskResult>;

  async stage(...args: P) {
    this.stagingOutput = await this._stage(...args);
  }

  async execute() {
    this.assertStagingHasCompleted();
    try {
      return await this._execute(this.stagingOutput!);
    } catch (err) {
      return TaskResult.Failure;
    }
  }

  private assertStagingHasCompleted() {
    if (this.stagingOutput === undefined) {
      throw Error('The task has not been staged');
    }
    return true;
  }
}



export abstract class ResumableTask<R, P, D> extends Task<R, [D, ...P[]]> {}
