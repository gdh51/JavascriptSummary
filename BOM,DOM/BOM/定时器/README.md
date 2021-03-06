# 定时器

`window`对象的`setTimeout()`方法用来实现一个函数在指定的毫秒数之后运行。`setTimeout()`返回一个值，这个值可以传递给`clearTimeout()`用于取消这个函数的执行。

`setInterval()`和`clearInterval()`同理。`setTimeout()`与`setInterval()`的第一个参数可以作为字符串传入，如果这么做这个字符串会在指定的超时时间或间隔之后进行求值。（相当于执行`eval()`）

如果以`0`毫秒的超时时间(浏览器默认最小时间为`4ms`左右，当小于时会自动更正，这通常是由于函数嵌套导致的)来调用`setTimeout()`，那么指定的函数不会立即执行。相反，它会立即加入队列中，等前面处于等待状态的事件处理程序全部执行完成后，再立即调用它。

这里面我们可以使用其他方法，来达到比`setTimeout()`的`0ms`。[setTimeout with a shorter delay](https://dbaron.org/log/20100309-faster-timeouts)

下面为其实现的代码：

```js
// Only add setZeroTimeout to the window object, and hide everything
// else in a closure.
(function () {
    var timeouts = [];
    var messageName = "zero-timeout-message";

    // Like setTimeout, but only takes a function argument.  There's
    // no time argument (always zero) and no arguments (you have to
    // use a closure).
    function setZeroTimeout(fn) {
        timeouts.push(fn);
        window.postMessage(messageName, "*");
    }

    function handleMessage(event) {
        if (event.source == window && event.data == messageName) {
            event.stopPropagation();
            if (timeouts.length > 0) {
                var fn = timeouts.shift();
                fn();
            }
        }
    }

    window.addEventListener("message", handleMessage, true);

    // Add the one thing we want added to the window object.
    window.setZeroTimeout = setZeroTimeout;
})();
```

这些函数还可以更多的参数,在第二个参数后的参数会依次作为传入回调函数的参数

```js
setTimeout((a, b) => {
    console.log(a, b); // 1, 2
  }, 40, 1, 2);
```

## 定时器执行的时机

Javascript是运行于单线程的环境中的，而定时器仅仅只是在未来的某个时间执行。

在Javascript中**没有任何异步代码是立即执行**的，但一旦进程空闲则尽快执行。

**定时器对任务队列的工作方式是，当特定时间过去后将代码插入(并不一定马上执行)任务队列**。如设定一个`150ms`后执行的定时器不代表到了`150ms`代码就立刻执行，它表示代码会在`150ms`后被加入到任务队列中，那么在主线程空闲时，它才会从任务队列取出然后执行。

### 重复的定时器

使用`setInterval()`时仅当没有该定时器的任何其他代码时，才将定时器代码添加到队列中，这确保了定时器代码**加入到队列中的最小时间间隔为指定间隔**。这种规则有两个问题：

1. **某些间隔会被跳过**

2. **多个定时器的代码执行之间的间隔可能会比预期的小**

假如给一个事件处理程序添加一个`setInterval()`函数。点触发该事件时，在运行到定时器代码时的指定时间后将其回调函数添加到队列，当*其他事件处理程序运行完毕*后便立即执行该定时器的回调函数;

如果在此代码运行期间，超过了定时器的时间间隔，那么就会将回调函数再次加入队列; 当第一个定时器代码运行时间超过1个单位以上定时器时间间隔时，之后的定时器便不会在添加到队列之中，之后**等待第一个定时器代码运行完成后便会立即执行**。

为了避免这个缺点，可以在定时器中*嵌套`setTimeout()`定时器*来解决这个问题。

```js
setTimeout(() => {
    //代码
    setTimeout(arguments.callee, interval);
}, interval);
```

每个浏览器窗口、标签页、或者`iframe`都有其*各自的代码任务队列*，对于这种情况最好是在接收`iframe`或者窗口中创建一个定时器来执行代码。
