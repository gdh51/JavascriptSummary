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

    event.respondWith(res);
});