# Web计时/浏览器渲染性能
Web计时机制的核心是`window.performance`对象，该对象有两个表示对象的属性：
其中一个为`performance.navigation`对象,它有以下属性
+ redirectCount：页面加载前的重定向次数
+ type：刚刚发生的导航类型：
  + 1:表示页面重载过
  + 2:表示通过后退或前进按钮打开的
  + 0:表示第一次加载

另外为`performance.timing`对象，该对象的属性都是时间戳。（从软件纪元开始经过的毫秒数），拥有以下属性：

+ navigationStart：开始导航到当前页面的时间
+ unloadEventStart：前一个页面的`unload`事件开始的时间。但只有在前一个页面与当前页面来自同一个域时这个属性才有值；
+ unloadEventEnd：前一个页面`unload`事件结束的时间。
+ redirectStart、redirectEnd：到当前页面的重定向开始或结束的时间。但只有在前一个页面与当前页面来自同一个域时这个属性才有值
+ fetchStart：开始通过`HTTP GET`取得页面的时间
+ domainLookupStart、domainLookupEnd：开始查询当前页面DNS的时间或查询当前页面DNS结束的时间
+ connectStart、connectEnd：浏览器尝试连接服务器的时间、服务器成功连接到服务器的时间。
+ secureConnectionStart：浏览器尝试以SSL方式连接服务器的时间。
+ requestStart、responseStart：浏览器开始请求页面的时间、浏览器接收到页面第一个字节的时间。
+ resopseEnd：浏览器接收页面所有内容的时间
+ domLoading：`document.readyState`变为`loading`的时间
+ domInteractive：`document.readyState`变为`interactive`的时间
+ domContentLoadedEventStart、domContentLoadedEventEnd：发生`DOMContentLoaded`事件的时间、`DOMContentLoaded`事件已经发生且执行完所有事件程序的时间