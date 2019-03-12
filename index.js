const path = require('path');
const fs = require('fs');
const http = require('http');
const { parse } = require('querystring');

const server = http.createServer((req, res) =>{

    if(req.method === 'POST' && req.url == '/send'){

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            fs.writeFile(path.join(__dirname, '/scraped', 'text.html'), parse(body).code, () => {});
        });
        req.on('end', () => {
            res.writeHead(301,{Location: '/result.html'});
            res.end();
        });

    }else{

        let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
        let extName = path.extname(filePath);
        let contentType = 'text/html';
        
        switch(extName){
            case '.css':
                contentType = 'text/css';
                break;
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.jpg':
               contentType = 'image/jpg';
                break;
        }
        
        fs.readFile(filePath, (err, content) => {
            res.writeHead(200, {'Content-Type': contentType})
            res.end(content, 'utf8');
        });
    }
        
});

const PORT = process.env.PORT || 80;
server.listen(PORT, () => {
    console.log(`Server Running on ${PORT}`);
});