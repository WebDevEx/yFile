/****************************************************************************
 ** @license
 ** This file is part of yFiles for HTML 2.3.0.3.
 **
 ** yWorks proprietary/confidential. Use is subject to license terms.
 **
 ** Copyright (c) 2020 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ***************************************************************************/
/**
 * This file provides a polyfill for the Promise object. Promise is supported by all modern browsers
 * since 2014, but not by any version of Internet Explorer. In more detail, Promise is supported by
 * all versions of Microsoft Edge, Google Chrome 33+, Firefox 29+, Safari 7.1+, and other browsers
 * that depend on these engines like Opera, Vivaldi, etc.
 *
 * This is a basic Promise implementation that doesn't completely implement the Promise specification,
 * but suffices for the APIs in yFiles for HTML that use promises. Basic usage in yFiles would be:
 * '''
 * var promise = api.methodThatReturnsAPromise();
 * promise.then(
 *  function(result){ console.log("promise resolved with value" + result)},
 *  function(error){ console.log("method failed with reason" + error)});
 * '''
 *
 * If you target older browsers and want to use the Promise API in your code, too, we recommend using
 * a more complete polyfill like the one provided by core-js.
 *
 * @yjs.keep
 */
(function (window) {
  if (typeof(window.Promise) == "undefined") {


    var runs = [];

    function run(fn, arg) {
      runs.push(fn);
      runs.push(arg);
      if (runs.length == 2) {
        setTimeout(function () {
          for (var i = 0; i < runs.length; i += 2) {
            var fn = runs[i];
            var arg = runs[i + 1];
            fn(arg);
          }
          runs.length = 0;
        }, 0);
      }
    }

    function resolvePromise(promise, value) {
      if (promise.state !== 0) return;
      promise.state = 1;
      promise.value = value;
      run(runResolveThens, promise);
    }

    function runResolveThens(promise){
      if (promise.thens.length > 0) {
        for (var i = 0; i < promise.thens.length; i++) {
          var child = promise.thens[i][0];
          var resolver = promise.thens[i][1];
          promise.thens[i][0] = null; // to avoid duplicate invocation
          promise.thens[i][1] = null; // to avoid duplicate invocation
          if (resolver) {
            try {
              promise.value = resolver(promise.value);
              if (promise.value instanceof Promise) {
                promise.value.then(function (val) {
                  resolvePromise(child, val);
                }, function (err) {
                  rejectPromise(child, err);
                })
              } else {
                resolvePromise(child, promise.value)
              }
            } catch (e){
              rejectPromise(child, e)
            }
          } else {
            resolvePromise(child, promise.value);
          }
        }
      }
    }

    function rejectPromise(promise, error) {
      if (promise.state !== 0) return;
      promise.state = 2;
      promise.value = error;
      run(runRejectThens, promise);
    }

    function runRejectThens(promise){
      if (promise.thens.length > 0) {
        var value = promise.value;
        for (var i = 0; i < promise.thens.length; i++) {
          var child = promise.thens[i][0];
          var rejecter = promise.thens[i][2];
          promise.thens[i][1] = null; // to avoid duplicate invocation
          if (rejecter) {
            try {
              value = rejecter(promise.value);
            } catch (e){
              value = e;
            }
          }
          rejectPromise(child, value);
        }
      }
    }


    /**
     *
     * @param {function(resolve, reject)} resolver
     * @constructor
     */
    function Promise(resolver) {
      var promise = this;
      promise.state = 0;
      promise.value = undefined;
      promise.thens = [];

      function resolveCallback(value) {
        resolvePromise(promise, value);
      }

      function rejectCallback(reason) {
        rejectPromise(promise, reason);
      }

      if (resolver){
        try {
          resolver(resolveCallback, rejectCallback);
        } catch (e) {
          rejectPromise(promise, e);
        }
      }
    }

    Promise.prototype.then = function(resolve, reject){
      var child = new Promise();

      run(function(promise){
        if (promise.state === 1){
          try {
            var result = resolve(promise.value);
            if (result instanceof Promise){
              result.then(function(val){
                resolvePromise(child, val);
              }, function(err){
                rejectPromise(child, err);
              })
            } else {
              resolvePromise(child, result);
            }
          } catch (e){
            rejectPromise(child, e);
          }
        } else if (promise.state == 2){
          if (reject){
            run(reject, promise.value);
          }
          rejectPromise(child, promise.value)
        } else {
          // remember
          promise.thens.push([child, resolve,reject]);
        }
      }, this);

      return child;
    };

    Promise.prototype.catch = function(reject) {
      return this.then(null, reject);
    };

    Promise.reject = function(reason){
      return new Promise(function(resolve, reject) {
        reject(reason);
      });
    };

    Promise.resolve = function(value){
      return new Promise(function(resolve) {
        resolve(value);
      });
    };

    Promise.all = function(promises) {
      // per spec, promises may be an iterable - since this is not a complete implementation,
      // assume it's an array

      if (promises.length === 0) {
        // Per spec we should return an already resolved Promise if the iterable passed is empty.
        // Return Promise.resolve([]) instead.
        return Promise.resolve([])
      }

      return new Promise(function(resolve, reject) {
          var results = new Array(promises.length);
          var counter = 0;

          var i, promise;
          for (i = 0; i < promises.length; i++) {
            promise = promises[i]
            if (promise instanceof Promise) {
              counter++;
            } else {
              results[i] = promise
            }
          }

          if (counter === 0) {
            // return an asynchronously resolved Promise if the iterable passed contains no promises.
            resolve(results)
          }

          // make sure that already resolved promises don't immediately resolve this promise - call
          // "then" only now.
          for (i = 0; i < promises.length; i++) {
            promise = promises[i]
            if (promise instanceof Promise) {
              promise.then(function(i, value) {
                results[i] = value;
                counter--;
                if (counter === 0) {
                  // Return a pending Promise in all other cases. This returned promise is then
                  // resolved/rejected asynchronously (as soon as the stack is empty) when all the
                  // promises in the given iterable have resolved, or if any of the promises reject.
                  resolve(results)
                }
              }.bind(null, i), reject)
            }
          }
      })
    }

    window.Promise = Promise;
  }
}("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this));
