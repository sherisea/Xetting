const express=require('express');
const path=require('path');
const server=express();

let directory=`${__dirname}/`;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const request=require('request');
const fs=require('fs');

const nhentaiPageListMax = 25;

const nhentai=require(`./modules/nhentai.js`);
const { Crawler }=require('./modules/crawlerController.js');
const { Logo }= require('./modules/Logo.js');

const port=3000;

//setup pug view direction
server.set("view engine", "pug");
server.set("views", path.join(`${__dirname}`, "dist"));

server.use(express.static('dist'));

server.get('/', function(req, res) {
    res.render('pug/index.pug');
});

server.get('/result',async function(req,res){

    let query = req.query.query;
    if (query === undefined) {
        res.writeHead(405, {"Content-Type": "text/plain"});
        res.write("405 Method Not Allowed.");
        res.end();
    }
    else {
        let source = (req.query.source == undefined ? ["nhentai","doujinantena"]: req.query.source);
        let page = (req.query.page == undefined ? 1 : req.query.page);
        if(page < 1) {
            page = 1;
        }
        console.log(source[0]);
        console.log(source[1]);
        let querypage = nhentaiPageListMax*(page - 1);
        console.log(querypage);
        let resultLength = 15;
        let result_nhentai = await Crawler[source[0]].search(query, querypage, querypage+resultLength);
        let result_doujinantena = await Crawler[source[1]].search(query, querypage, querypage+resultLength)
        let result = result_nhentai.concat(result_doujinantena);
        console.log(result);
        res.render('pug/result.pug',{
            result:result_nhentai
        })
    };
//     //crawl first 15 book result
//     let result =await Crawler.doujinantena.search(req.query.query,0,14);
//     result.forEach(element => {
//       //since same-origin policy, we use cors-anywhere to get request from doujinantena
//         element.thumbnail='http://140.116.102.103:8080/'+element.thumbnail;
//     });
    res.render('pug/result.pug',{
        result:result
    });
});

server.get('/detail',async function(req,res){
    console.log(req.query.source);
    console.log(req.query.booknumber);
    let source = req.query.source;
    console.log(source);
    let booknumber = req.query.booknumber;
    let result = await Crawler[source].bookDetail(booknumber);
    console.log(result);
    if(result === undefined) {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("Oops, there might be something wrong.");
        res.end();
    }
    else {
        res.render('pug/detail.pug',{
            title:result.title,
            artists:result.artists,
            tags:result.tags,
            thumbnails:result.thumbnails,
            originUrl:result.originUrl,
            source:source,
            booknumber:booknumber
        });
    }
});

server.get('/api/download',async function(req,res){
    let source=req.query.source;
    let bookNumber=req.query.bookNumber;
    console.log(source);
    console.log(bookNumber);
    console.log(typeof(bookNumber));
    let result = await Crawler[source].downloadBook(bookNumber);
    console.log(result);
    res.json(result);
});

server.get('/api/',async function(req,res){
    
    let logo=Logo[Math.floor(Math.random()*2)];
    let slogan=`Xetting-Crawler of some image host sites`;
    res.status(200).send(logo+'\n'+slogan+'\n');
});

server.listen(port);
console.log(`server open on ${port}`);