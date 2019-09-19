const http = require('http');
const fs = require('fs');

http.createServer(function (req, res) {
    console.log(req.url);
    if (req.url === '/') {
        res.writeHead(200, {
            'Content-type': 'text/html'
        });

        fs.readFile('./index.html', function (err, file) {
            if (err) {
                throw err;
            }

            res.end(file);
        });
    } else if (req.url === '/css/style.css') {
        res.writeHead(200, {
            'Content-type': 'text/css'
        });
        fs.readFile('./css/style.css', function (err, file) {
            if (err) {
                throw err;
            }

            res.end(file);
        });
    } else if (req.url === '/js/main.js') {
        res.writeHead(200, {
            'Content-type': 'text/javascript'
        });
        fs.readFile('./js/main.js', function (err, file) {
            if (err) {
                throw err;
            }

            res.end(file);
        });
    } else if (req.url === '/sw.js') {
        res.writeHead(200, {
            'Content-type': 'text/javascript'
        });
        fs.readFile('./sw.js', function (err, file) {
            if (err) {
                throw err;
            }

            res.end(file);
        });
    }
}).listen(1000);