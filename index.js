const path = require('path');
const fs = require('fs');
const http = require('http');
const uuid = require('uuid');
const cheerio = require('cheerio');
const { parse } = require('querystring');

const server = http.createServer((req, res) =>{

    if(req.method === 'POST' && req.url == '/send'){

        var id = uuid.v4();
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            fs.writeFile(path.join(__dirname, '/scraped', id + '.html'), parse(body).code, () => {});
        });
        req.on('end', () => {
            res.writeHead(301,{Location: '/result.html?q='+id});
            res.end();
        });

    }else if(req.url.includes('/scraper')){

        var id = req.url.slice(9);
        var data = new Object;
        const $ = cheerio.load(fs.readFileSync(`scraped/${id}.html`));

        data.subjects = [];
        data.sessional = [];
        data.sessional[0] = [];
        data.sessional[1] = [];
        data.sessional[2] = [];
        data.attendance = [];
        data.attendanceOutOf = [];

        var sessional = [3, 9, 15];
        var attendance = [4, 6, 10, 12, 16, 18];
        var attendanceOutOf = [5, 7, 11, 13, 17, 19];
    
        $('tbody tr').each((i, elem) => {

            data.subjects[i] = $(elem).children().eq(1).text();
            
            for(var k=0; k<3; k++){

                if($(elem).children().eq(sessional[k]).text() != '- -'){
                    data.sessional[k][i] = parseInt($(elem).children().eq(sessional[k]).text());
                }else{
                    data.sessional[k][i] = 0;
                }
            }

            var t = 0, u=0;
            for(var j=0; j<6; j++){

                if($(elem).children().eq(attendance[j]).text() != '- -'){
                    t += parseInt($(elem).children().eq(attendance[j]).text());
                }
                if($(elem).children().eq(attendanceOutOf[j]).text() != '- -'){
                    u += parseInt($(elem).children().eq(attendanceOutOf[j]).text());
                }
            }
            data.attendance[i] = t;
            data.attendanceOutOf[i] = u;
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
        
    }else if(req.url.includes('/result.html')){

        let filePath = path.join(__dirname, 'public', 'result.html');
        fs.readFile(filePath, (err, content) => {
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(content, 'utf8'); 
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