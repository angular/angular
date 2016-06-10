import {RouteLifecycleHook} from './lifecycle_annotations_impl';

export function hasLifecycleHook(e: RouteLifecycleHook, instance): boolean {
  return e.name in instance;
}
