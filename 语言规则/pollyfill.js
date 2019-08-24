//模拟call
Function.prototype.pollycall = function (ctx) {

  // 确认this指向
  ctx = ctx ? Object(ctx) : window;
  var args = [];
  for (var i = 1; i < arguments.length; i++) {
    args.push('arguments[' + i + ']');
  }
  ctx.fn = this;

  // 由于要动态执行函数, 则要么使用eval()要么使用new Function()
  var result = eval('ctx.fn(' + args.toString() + ')');
  delete ctx.fn;

  return result;
}

//模拟bind
Function.prototype.pollybind = function (ctx) {
  let args1 = [].slice.call(arguments, 1);
  let that = this;
  return function () {
    let args2 = [].slice.call(arguments);
    let args = args1.concat(args2);
    return that.apply(ctx, args);
  }
}

// 实现求和柯里化，即add(1)(2)(3) 等同于 add(1, 2, 3)
function add(x) {
  function sum(y) {
    x = x + y;
    return sum;
  }
  sum.toString = function () {
    return x;
  }

  return sum;
}

// 仿写new操作符
function instance(fn) {
  typeof fn == 'function' ? '' : new Error('???');
  let args = [].slice.call(arguments, 1);
  let obj = {};
  obj.__proto__ = fn.prototype;
  let result = fn.apply(obj, args);
  obj = typeof result == obj ? obj : result;
  return obj;
}