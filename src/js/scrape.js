var request = require('request')
var cheerio = require('cheerio')
var moment = require('moment')
var schedule = require('node-schedule')
var fs = require('fs')

// FIREBASE SETUP //
var admin = require('firebase-admin')
var serviceAccount = require('../firebase.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://express-thing-node.firebaseio.com'
})
var db = admin.database()
var ref = db.ref('/')
// END FIREBASE SETUP //

// FIREBASE TESTING //
console.log('///// FIREBASE TESTS /////')

var phoneArray = []

// GETS DATE03 OBJECT AND PUSHES TO EMPTY ARRAY //
// TEMP USE - FOR PHONE NUMBERS EVENTUALLY //
// NUMBERS WILL BE PUSHED TO SINGLE ARRAY //
// ref
//   .orderByChild('date03')
//   .limitToLast(1)
//   .on('child_added', function(snapshot) {
//     phoneArray.push(snapshot.val().date03)
//     console.log(snapshot.val().colors)
//     console.log(snapshot.val().date03)
//   })

// CALLS PHONEARRAY AFTER IT'S BEEN PUSHED //
setTimeout(function() {
  console.log('phoneArray: ' + phoneArray)
}, 2000)
// END FIREBASE TESTING //

// START ACTUAL APP //
var scrapeCount = 0

// 24 HOUR TIMER //
var j = schedule.scheduleJob('*/5 * * * * *', function() {
  console.log('Something about the best of times and the worst of times...')

  // RESET VARIABLES //
  var listArray = []
  var listArray02 = []
  var myColor = []
  var today = moment().format('MM/DD/YYYY')
  var todayLong = moment().format('MMMM DD, YYYY')
  var yesterday = moment()
    .subtract(1, 'days')
    .format('MM/DD/YYYY')
  var fbaseToday = moment().format('YYYYMMDD')

  // START JAMS SCRAPE //
  var scrape = function() {
    request('http://www.jamstesting.com/jamsTestDates/', function(
      err,
      res,
      body
    ) {
      if (!err && res.statusCode === 200) {
        console.log('scraping jams...')
        const $ = cheerio.load(body)

        $('tr:nth-child(n+2)').each(function() {
          let color = $(this).text()
          // PUSH COLORS TO ARRAY //
          listArray.push(color)
        })
        // CLEAN UP ARRAY //
        listArray.shift()
        var listArray02 = listArray.map(function(item, index) {
          return item
            .replace(today, '')
            .replace(yesterday, '')
            .replace(/[\n\t\r ]/g, '')
        })
      }
      scrapeCount = scrapeCount + 1
      newarr = []
      newobj = {}

      // COUNTER TEST ///


      // var count = db.ref('test/count');
      // count.transaction(function(currentRank) {
      //   // If users/ada/rank has never been set, currentRank will be `null`.
      //   return currentRank + 1;
      // });
      
      var countArray = ["ytd", "month", "week"]
      for (var xx = 0; xx < listArray02.length; xx++) {
        for (var yy = 0; yy < countArray.length; yy++) {
          var countTest = db.ref('color_data/' + listArray02[xx] + '/' + countArray[yy]).transaction(function(count) {
            return count + 1
          })
        }





      }

      








      // END COUNTER TEST ///



      // PUSH EACH COLOR TO FIREBASE //
      for (var c = 0; c < listArray02.length; c++) {

        var adate = moment().format()
        var colorData = db.ref('color_data/' + listArray02[c]).push({iso: adate})
        var dateKey = colorData.key
        colorRef = db.ref('today').set({color: listArray02[c], date: todayLong})
      }
      var newobj = {date: {iso: moment().format()}}
        var colorObj = {}
          listArray02.forEach(function(data) {
            color: newobj[data] = data
          })
        
        colorRef = db.ref('today/colors').push(newobj)

      
        





      // CONVERT ARRAY TO OBJECT //
            var obj = {}
            listArray02.forEach(function(data) {
              obj[data] = data
            })
      // SET DAILY OBJECT //
      var dailyObj = {
        date: today,
        date02: moment().format('MMMM DD, YYYY'),
        date03: moment().format('MMMM DD, YYYY hh:mm:ss'),
        yesterday: yesterday,
        colors: obj
      }



      // PUSH TO FIREBASE //
      //// ref.push(dailyObj)
      console.log(dailyObj)
      



      // WRITE DAILYOBJ TO JSON FILE //
      require('fs').writeFile(
        'colors.json',

        JSON.stringify({ jams: dailyObj }),

        function(err) {
          if (err) {
            console.error('Failed to write JSON')
          } else {
            console.log('JSON Export Successful')
            console.log(
              'JAMS Scraped ' + scrapeCount + ' times since last reboot'
            )
          }
        }
      )
    })

    return
  }
  // END JAMS SCRAPE //

  // CALL SCRAPE FUNCTION //
  scrape()
})
// END 24 HOUR TIMER //
