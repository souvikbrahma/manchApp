var express = require('express');
var mongo = require("mongodb").MongoClient;
var ObjectId = require('objectid');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var secret = "S7gjlj4@khj";


var app = express();

var dburl = "mongodb://developer:SkillTransit@13.58.133.122:27017/anoclub_dev?authSource=admin";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var roles;
app.use(function(req, res, next){

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var ua = req.headers['user-agent'];
    var api = req.url.split("?")[0].trim().replace(/"/g, "\\\"");
    if(req.query.jwtCheck == null){
        
        if(api == "/api/logIn"){
            next();
        }
        else if(api == ""){
            next();
        }
        else{
            res.send({
                status: "Token not found"
            });
        }
    }
    else {
        var token = req.query.jwtCheck;

        var decoded = jwt.decode(token, secret);
        uid = decoded.uid;
        roles = decoded.role;
        next();

    }
});

app.post('/api/addUser', function(req, res){

    console.log(roles);

    if(roles == "1"){

        var userName = req.body.userName;
        var name = req.body.name;
        var phoneNumber = req.body.phoneNumber;
        var role = req.body.role;
        var dob = req.body.dob;
        var pass = req.body.pass;
    
        //console.log(dbQuery);
    
        mongo.connect(dburl, { useNewUrlParser: true }, function(err, db){
            var dbo = db.db("anoclub_dev");
            var table = dbo.collection("users");
        
            var dbQuery = {
                phoneNumber: phoneNumber
            };
    
            table.findOne(dbQuery, function(err, resp){
                if(err) throw err;
    
                if(resp == null){
    
                    var dbQuery = {
                        userName: userName,
                        pass: pass,
                        name: name,
                        phoneNumber: phoneNumber,
                        role: role,
                        dob: dob
                    };
    
                    table.insertOne(dbQuery, function(err, resp){
                        if(err) throw err;
                
                        console.log(resp.ops[0]._id);
            
                        var tokenData = {
                            uid : resp.ops[0]._id,
                            role :  role
                        };
            
                        var jwtToken = jwt.sign(tokenData, secret);
                        var dbQuery = {
                            _id: resp.ops[0]._id
                        };
            
                        table.updateOne(dbQuery, {$set: { jwtToken : jwtToken }}, function(err, resp){
                            console.log(resp);
                            var reply = {
                                status: "Profile Added Successfully",
                            };
                            res.send(reply);
                        });
            
                    });
                }
                else {
                    var reply = {
                        status: "Profile already exists !",
                    };
                    res.send(reply);
                }
    
            });
    
        });

    }
    else {
        var reply = {
            status: "Sorry ! You need to have Admin Priviledges !",
        };
        res.send(reply);
    }

    

});

app.post('/api/logIn', function(req, res){

    var userName = req.body.userName;
    var pass = req.body.pass;

    mongo.connect(dburl, { useNewUrlParser: true }, function(err, db){
        var dbo = db.db("anoclub_dev");
        var table = dbo.collection("users");

        var dbQuery = {
            userName: userName,
            pass: pass
        };

        table.findOne(dbQuery, function(err, resp){
            if(err) throw err;

            if(resp == null){
                var r = {
                    status: "Please check the Username and Password"
                };
                res.send(r);
            }
            else {
                var r = {
                    status: "Welcome back !",
                    jwtToken: resp.jwtToken
                };
                res.send(r);
            }
        });

    });

});

app.post('/api/userList', function(req, res){

    mongo.connect(dburl, { useNewUrlParser: true }, function(err, db){
        var dbo = db.db("anoclub_dev");
        var table = dbo.collection("users");

        if(req.body.name == null && req.body.role == null && req.body.dob == null){
            table.find({}, { userName: 1, name: 1, dob: 1, pass: 0 }).toArray(function(err, resp){
                if(err) throw err;
    
                var array = [];
                resp.map((x) => array.push({ userName: x.userName, name: x.name, dob: x.dob }));
                console.log(array);
                res.send(array);
    
            });
        }
        else if(req.body.name != null){
            table.find({ name : req.body.name }, { userName: 1, name: 1, dob: 1, pass: 0 }).toArray(function(err, resp){
                if(err) throw err;
    
                var array = [];
                resp.map((x) => array.push({ userName: x.userName, name: x.name, dob: x.dob }));
                console.log(array);
                res.send(array);
            });
        }
        else if(req.body.role != null){
            table.find({ role : req.body.role }, { userName: 1, name: 1, dob: 1, pass: 0 }).toArray(function(err, resp){
                if(err) throw err;
    
                var array = [];
                resp.map((x) => array.push({ userName: x.userName, name: x.name, dob: x.dob }));
                console.log(array);
                res.send(array);
            });
        }
        else if(req.body.dob != null){
            table.find({ dob : req.body.dob }, { userName: 1, name: 1, dob: 1, pass: 0 }).toArray(function(err, resp){
                if(err) throw err;
    
                var array = [];
                resp.map((x) => array.push({ userName: x.userName, name: x.name, dob: x.dob }));
                console.log(array);
                res.send(array);
    
            });
        }

    });

});


var port = process.env.port || 3000;

app.listen(port, function(){
    console.log("Listenning on port "+port);
});