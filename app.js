var sendRequest = require("send-http-request");
var urlencode = require('urlencode');
var Firebase = require('firebase');
var cheerio = require('cheerio');
var sleep = require('sleep');




getFirebaseData(new Firebase('https://tainanlandmark.firebaseio.com/'));


function getFirebaseData(ref) {

    ref.on('value', function (data) {

        console.log('Get data success');
        var list = data.val();

        for (var i in list) {

            findZipCode(list[i].address);
        }
    });
}


function findZipCode(address) {


    sendRequest("GET", "http://tools.5432.tw/zip5?adrs=" + urlencode(address)).then(
        function (response) {

            var zipCode;

            $ = cheerio.load(response.text);

            console.log('Address: ' + address);
            zipCode = $('.zip5-result-result').html().replace(" ", "");
            console.log(zipCode);
            console.log('-----------------------');
            sleep.sleep(0.5);
        },

        function (error) {
            console.error(error)
        }
    );
}

function setZipCode(zipCode) {

}
