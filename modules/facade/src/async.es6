export var Future = Promise;

export class FutureWrapper {
  static value(obj):Future {
    return Future.resolve(obj);
  }

  static error(obj):Future {
    return Future.reject(obj);
  }

  static wait(futures):Future {
    if (futures.length == 0) return Future.resolve([]);
    return Future.all(futures);
  }

  static catchError(future:Future, onError:Function):Future {
    return future.catch(onError);
  }
}