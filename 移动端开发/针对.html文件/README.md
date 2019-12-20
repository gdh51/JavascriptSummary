# 针对.html文件

关于该文件，移动端最先该处理的就是该文件中的元数据字段，通过设置这些字段来控制用户在移动端的行为，具体有以下部分：

## meta字段

设置H5页面窗口自动调整到设备宽度，并禁用用户缩放页面：

```html
<meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no" />
```

忽略将页面中的数字识别为电话号码：

```html
<meta name="format-detection" content="telephone=no" />
```

忽略Android平台中对邮箱地址的识别

```html
<meta name="format-detection" content="email=no" />
```

`target-densitydpi`表示使当前页面像素密度等于设备的像素密度，具有以下四个值：

- `device-dpi`：
- `high-dpi`：使用高等像素作为目标的dpi，低等像素和中像素密度设备相应缩小。
- `medium-dpi`：使用中等像素作为目标的dpi，低等像素放大和高像素密度设备相应缩小。(默认值)
- `low-dpi`：使用低等像素作为目标的dpi，中等像素和高像素密度设备相应放大。
- `<value>`：使用一个具体的dpi值作为目标的dpi，取值范围为70~400

### 针对Safari

当网站添加到主屏幕快速启动方式，可隐藏地址栏，仅针对ios的safari

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<!-- ios7.0版本以后，safari上已看不到效果 -->
```

将网站添加到主屏幕快速启动方式，仅针对ios的safari顶端状态条的样式

```html
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
<!-- 可选default、black、black-translucent -->
```