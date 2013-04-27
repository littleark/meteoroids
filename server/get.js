var mongo=require('mongodb'),
    Db=mongo.Db,
    Server=mongo.Server,
    events = require('events');
var config = require("./config");

var express = require('express');
var fs      = require('fs');


var db=new Db(config.db,new Server(config.host,config.port,{auto_reconnect:true}),{safe:false});
var collection_name=config.collection;

var __dirname=process.cwd();

// Setup a very simple express application.
var app = express();
// The client path is for client specific code.
//app.use('/client', express.static(__dirname + '/client'));
// The common path is for shared code: used by both client and server.
//app.use('/common', express.static(__dirname + '/common'));

//app.use('/web', express.static(__dirname + '/web'));

app.get("/health",function (req, res) {
    res.send('1');
})

// The root path should serve the client HTML.
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/placeholder.html');
});


var p_client=null;
db.open(function(err,client){

	app.listen(8081);
	console.log("listening on 8081");

	p_client=client;

	client.authenticate(config.user, config.pwd,function(err2,client){
		p_client.collection(collection_name, function(err, col) {

			app.get('/data', function (req, res) {
				var pars={
					'year':{$ne:'',$gt:0},
					'fell_found':'Fell',
					'mass_g':{$gt:0},
					'type_of_meteorite':{$nin:[/Doubt/,/Discredited/]}
				};//,$gte:1900

				col.find(pars, {sort:[['year','asc']]}, function(err, cursor){
					cursor.limit(3000);
					var meteorites=[];

					function addMeteorite(){
						cursor.nextObject(function(err, doc) {
							if(doc!=null) {
								//console.log(doc)
								var m={
									m:doc.mass_g,
									y:doc.year,
									p:doc.place,
									c:doc.country?doc.country.country:""
									//year_date:doc.year_date,
									//fell_found:doc.fell_found
								};
								meteorites.push(m);
								addMeteorite();
							} else {
								res.header('Content-Type','application/json; charset=utf-8');
								res.header('Access-Control-Allow-Headers', 'Content-Type');
								res.header('Access-Control-Allow-Origin', '*');
								res.header('Access-Control-Allow-Methods', 'GET,POST');


								res.write(JSON.stringify(meteorites));
								res.end();
							}
						}); 
					}
					addMeteorite();
				});
			});
		});
	});
});
