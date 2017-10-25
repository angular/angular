# Notes

* TreeNode is not public. Decision: change it to a POJO, so tree information is "easily" serializable.



# DEFINE:

# TODOS:

* DONE Replace TreeNode with a POJO
* DONE Implement a function to convert a "tree node" of RouteSnapshot into RouterStateSnapshot
* DONE Change recognize to construct a TreeNode<RouteSnapshot> and then convert it to RouterStateSnapshot in the router


* Change Preactivation
  * Fix type errors (mostly tests)
  * Make guards pass locally
  * Inherit resolve
  * Make resolve pass locally
  
* Fix "boom" error message
* eualParamsAndUrlSegments needs to have the logic to check all the way to the root
MILESTONE:
  * All tests should pass

* Change Activation


* Change RouteStateSnapshot to store a proper URL tree address ({node: number[], segmentIndex: number}) instead of the group itself. Change createUrlTree to use that. 
* Make TreeNode.children optional
* Maybe make UrlSegment a POJO? or map the data into url segments in our helper function