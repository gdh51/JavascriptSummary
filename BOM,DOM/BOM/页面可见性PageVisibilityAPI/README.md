# 页面可见性 Page Visibility API
让开发人员知道页面是否对用户可见（如页面最小化，隐藏在其他标签页后）（必须加浏览器前缀）
由三个部分组成：
+ `document.hidden`：表示页面是否隐藏的布尔值。页面隐藏包括页面在后台标签页中或浏览器最小化

+ `document.visibilityState`：表示4个可能状态的值：
  + hidden:页面在后台标签页中或浏览器最小化
  + visible:页面在前台标签页中
  + 实际的页面已经隐藏，但用户可以看到页面的预览
  + prerender:页面在屏幕外执行预渲染处理

+ `visibilitychange`事件：当文档从可见变为不可见或从不可见变为可见时，触发该事件
必须在DOM3级事件处理程序上添加（`window.addEventListener()`）