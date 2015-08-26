var sendRequest = require("send-http-request");
var urlencode = require('urlencode');
var Firebase = require('firebase');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var async = require('async');
var http = require('http');


var Schema = mongoose.Schema;
var landmarkSchema = new Schema({
    address: String,
    zipCode: String,
    imageUrl: String,
    landmarkX: String,
    landmarkY: String,
    landmarkchinesename: String,
    landmarkopentime: String,
    landmarkpoints: String,
    phonenumber: String,
    websiteUrl: String
});

var LandMark = mongoose.model('tainan-landmark', landmarkSchema);

var db;


/**
 * Connect to monogo db
 */
function connectDB() {

    mongoose.connect('mongodb://admin:admin@ds039073.mongolab.com:39073/landmark');
    db = mongoose.connection;


    db.on('error', console.error.bind(console, 'connection error:'));

    db.on('open', function (callback) {

        console.log('Open monogodb');
        getFirebaseData(new Firebase('https://tainanlandmark.firebaseio.com/'));
    });
}


/**
 * Get data from firebase
 * @param {Object} ref - Firebase reference
 */
function getFirebaseData(ref) {

    ref.on('value', function (data) {

        console.log('Get data success from firebase');
        var list = data.val();

        findZipCode(list);
    });
}

/**
 * Find zip code from http://zipcode.mosky.tw
 * @param {Array} data - Tainan landmark data
 */
function findZipCode(data) {

    async.each(data, function (item, callback) {

        var address = item.address;
        var url = "http://zipcode.mosky.tw/api/find?address=" + urlencode(address);

        sendRequest("GET", url).then(

            function (response) {

                var zipCode;

                $ = cheerio.load(response.text);

                zipCode = JSON.parse(response.text).result;
                item.zipCode = zipCode;


                console.log(address);
                console.log(item.zipCode);

                callback();
            },
            function (error) {

                console.error(error)
            }
        );

    }, function (err) {

        if (err) {
            console.log(err);
        } else {

            console.log('All is done');

            // console.log(data);
            saveToDB(data);
        }
    });


}

/**
 * Save data to mongo db
 * @param {Array} list - Tainan landmark data
 */
function saveToDB(list) {

    async.each(list, function (item, callback) {

        var landmark = new LandMark({
            address: item.address,
            zipCode: item.zipCode,
            imageUrl: item.imageUrl,
            landmarkX: item.landmarkX,
            landmarkY: item.landmarkY,
            landmarkchinesename: item.landmarkchinesename,
            landmarkopentime: item.landmarkopentime,
            landmarkpoints: item.landmarkpoints,
            phonenumber: item.phonenumber,
            websiteUrl: item.websiteUrl
        });

        landmark.save(function (err, landmark) {

            if (err) {

                console.log(err);
            } else {

                callback();
            }
        });

    }, function (err) {

        if (err) {
            
            console.log(err);
        } else {
            
            console.log('Save to mongo db success');
            mongoose.connection.db.close(function (err) {
                if (err) throw err;
            });
        }
    });
}


//----------------------------------------------------------
//----------------------------------------------------------
//----------------------------------------------------------


connectDB();