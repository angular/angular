# Notes

* TreeNode is not public. Decision: change it to a POJO, so tree information is "easily" serializable.



# DEFINE:

# TODOS:

* DONE Replace TreeNode with a POJO
* Implement a function to convert a "tree node" of RouteSnapshot into RouterStateSnapshot
* Change recognize to construct a TreeNode<RouteSnapshot> and then convert it to RouterStateSnapshot in the router


* Make TreeNode.children optional
* Maybe make UrlSegment a POJO?