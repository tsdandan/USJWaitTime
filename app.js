var express = require('express');
var url = require('url'); //解析操作url
var superagent = require('superagent'); //这三个外部依赖不要忘记npm install
var cheerio = require('cheerio');
var redis = require('redis'),
	client = redis.createClient("6379", "127.0.0.1", {});

var targetUrl = 'http://usjinfo.com/wait/realtime.php';

function grap(){
	superagent.get(targetUrl)
    .end(function (err, res) {
    	res.toString("utf-8");
        var $ = cheerio.load(res.text);
        var $table = $("#contents > table");
        var date = new Date();
    	var hour = date.getHours();
    	var day = date.getDate();
    	var month = date.getMonth() + 1;
    	var minute = date.getMinutes();
    	var hashKey = month + "/" + day;
    	var score = date.getTime();
    	var multi = client.multi();
    	console.log(hashKey);
        $table.find("tr").each(function(idx, element){
        	var $tr = $(element);
        	var actionName = $($tr.find("td > a").get(0)).html();
        	var waitTime = $($tr.find("td").get(1)).html();
        	actionName = actionName.replace(/[\n\t\r]/g,"");
        	waitTime = waitTime.replace(/[\n\t\r]/g,"");
        	var key = hashKey + ":" + idx;
        	console.log(key);
        	console.log(score);
        	multi.hset(key,  score , waitTime);
        });
        multi.exec(function(err, replies){
        	console.log(replies);
        });
    });
}

grap();

setInterval(function(){
	grap();
}, 300000);