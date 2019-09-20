// 自定义的缓存名称
const CACHE_NAME = 'my-cache';

// 我们想缓存的文件
let urlsToCache = [
    '/',
    '/css/style.css',
    '/js/main.js'
];

// Set the callback for the install step
self.addEventListener('install', function (event) {
    // Perform install steps

    // 通过caches.open()来打开对应名称的缓存, 然后调用cache.addAll()将文件的数组传入
    // 这里的全部过程都是基于Promise来实现的
    event.waitUntil(caches.open(CACHE_NAME)
        .then(function (cache) {
            console.log('cache Opened');
            return cache.addAll(urlsToCache);
        }))
});

// 缓存优先策略，优先发送缓存，没有时在产生真实请求
self.addEventListener('fetch', function (event) {

    let res = event.respondWith(

        // 匹配缓存
        caches.match(event.request)
        .then(function (response) {

            // 命中缓存就返回响应
            if (response) {
                return response;
            }

            // 否则发送真实请求
            return fetch(event.request);
        })
    );

    // event.respondWith(res);
});

// 监听一个sync事件，在SyncEvent对象上来检查tag是否匹配我们在点击事件中自定义的事件标签
// 如果多个 tag 标记为 submit 的 sync事件被注册了，sync 事件处理器只会运行一次。
// 所以在这个例子里， 如果用户离线了， 然后点击按钮7次， 当网络再次连上， 所有的sync注册都会合而为一， sync事件只会触发一次。
// 如果你希望每一次点击都能触发 sync 事件，你就需要在注册的时候赋予它们不同的tag。
self.addEventListener('sync', function (event) {
    if (event.tag === 'submit') {
        console.log('sync!');
    }
});

// sw.js
self.addEventListener('notificationclick', event => {
    // 消息提醒被点击的事件
    console.log('mention');
});

self.addEventListener('notificationclose', event => {
    // 消息提醒被关闭的事件
    console.log('infoClose');
});