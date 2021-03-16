var http = require('http');
var unirest = require('unirest');
var random_useragent = require('random-useragent');
const isUrl = require("is-valid-http-url");
const fs = require('fs');
var encodeUrl = require('encodeurl');
http.createServer(function (req, res) {
    res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "content-type": "text/plain"
    });
    function err404(data){
      res.end(data);
    };
    var resStatus={
      "status":"error",
      "data":"null"
    };
    if(req.url=="/" && req.method === "POST"){
      var body = '';
      req.on('data', function(data) {
          body += data;
      });
      req.on('end', function (){
        var db={
          "data":"",
        };
        try{
          var come=JSON.parse(body);
          if(come.data==undefined){
            db=db;
          } else {
            db.data=come.data;
          };
        } catch(e){
          db=db;
        };
        if( isUrl(db.data)==true ){
          unirest('GET', "https://www.alexa.com/siteinfo/"+db.data)
          .headers({
              'user-agent': random_useragent.getRandom()
          })
          .end(function (resku) {
            try{
              var dataIncoming=resku.raw_body;
              dataIncoming=dataIncoming.split("dataLayer.push(")[1].split("});")[0]+"}";
              dataIncoming= JSON.stringify(JSON.parse(dataIncoming).siteinfo.rank.global);
              resStatus.data=dataIncoming;
              resStatus.status="ok";
              if(resStatus.data=="false"){
                 resStatus.data="0";
                 res.end(JSON.stringify(resStatus));
              } else {
                res.end(JSON.stringify(resStatus));
              }
              pingUrl(db.data);
            }catch(e){
              res.end(JSON.stringify(resStatus));
            };
          });
        } else{
          err404(JSON.stringify(resStatus));
        };
      });
    } else if(req.url=="/demo" && req.method === "GET"){
      res.writeHead(200, {
          "content-type": "text/html"
      });
      fs.readFile('test.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
      });
    } else {
      err404(JSON.stringify(resStatus));
    };
    var startNumner=0;
    
    function pingUrl(data){
      unirest('GET', data)
      .headers({
          'Referer':"https://www.maskoding.com/p/aq.html",
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-user': '?1',
          'user-agent': random_useragent.getRandom()
      })
      .end(function (resku) {
        if(startNumner<5){
          startNumner=startNumner+1
          pingUrl(data);
        };
      });
    }
}).listen(process.env.PORT);
