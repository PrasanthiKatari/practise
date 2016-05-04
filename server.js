var express = require("express");
var path = require("path");
var bodyparser = require("body-parser");
var mongodb = require("mongodb");
var objectID = mongodb.objectID;

var contacts_collection = "contact";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyparser.json());

var db;


mongodb.MongoClient.connect("mongodb://abc123:abc123@ds013192.mlab.com:13192/sample", function (err, database) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    db = database;
    console.log("database connection ready");

    var server = app.listen(process.env.port || 3400, function() {
        var port = server.address().port;
        console.log("app now running on port", port);
    });
    });
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}


app.post("/contacts", function(req, res) {
    var newContact = req.body;
    newContact.createDate = new Date();

    if (!(req.body.firstName || req.body.lastName)) {
        handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
    }

    db.collection(contacts_collection).insertOne(newContact, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to create new contact.");
        } else {
            res.status(201).json(doc.ops[0]);
        }
    });
});
app.get("/contacts", function(req, res) {
    db.collection(contacts_collection).find({}).toArray(function(err, docs) {
        if (err) {
            handleError(res, err.message, "Failed to get contacts.");
        } else {
            res.status(200).json(docs);
        }
    });
});

app.get("/contacts/:id", function(req, res) {
    db.collection(contacts_collection).finOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get contact");
        } else {
            res.status(200).json(doc);
        }
    });
});

app.put("/contacts/:id", function(req, res) {
    var updateDoc = req.body;
    delete updateDoc._id;

    db.collection(contacts_collection).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to update contact");
        } else {
            res.status(204).end();
        }
    });
});

app.delete("/contacts/:id", function(req, res) {
    db.collection(contacts_collection).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
        if (err) {
            handleError(res, err.message, "Failed to delete contact");
        } else {
            res.status(204).end();
        }
    });
});

