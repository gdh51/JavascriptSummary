const http = require('http');
const fs = require('fs');
const path = require('path');

let app = http.createServer(function (req, res) {
    if (req.url === '/') {
        fs.readFile(path.resolve(__dirname, './fetch.html'), function (err, file) {
            res.writeHead(200, 'Content-Type:text/html');
            res.end(file);
        });
    } else if (req.url === '/file') {
        let result = [];
        req.on('data', function (data) {
            result.push(data);
        });

        req.on('end', function () {
            console.log(result)
            fs.writeFileSync('./xx.jpg', result.concat(result), 'binary');
            res.writeHead(200);
            res.end('111');
        });
    } else {
        res.writeHead(200, 'Content-Type:text/plain');
        res.end('{"a": "2"}');
    }
});

app.listen(8080, function () {
    console.log('runing')
});