const express = require('express');
const router = express.Router();
const Person = require("../models/Person");
const TTStats = require("../models/TTStats");
const PoolStats = require("../models/PoolStats");
const Elo = require("../EloCalculator");
router.get("*", (req, res) => {
  TTStats.find({}, (err, foundTTStats) => {
    PoolStats.find({}, (err, foundPoolStats) => {
      function compare(statA, statB) {
        if (statA.elo < statB.elo) {
          return 1;
        } else {
          return -1;
        }
      }
      foundTTStats.sort(compare);
      foundPoolStats.sort(compare);
      res.render("index", {TTStats: foundTTStats, PoolStats: foundPoolStats});
    });
  });
});

// CREATE A NEW PERSON WITH A CLEAN SLATE OF SCORES
router.post("/add", (req, res) => {
  if (req.body.channel_name != "pool-ranking") {
    res.set({
      'Content-Type': 'application/json'
    });
    res.status(200).send({'text': 'Sorry, you need to be in the pool-ranking channel to run this command'})
  } else {
    var aText;
    if (req.body.text) {
       aText = req.body.text.split(" ");
    }
    var firstName = req.body.firstName || aText[0];
    var lastName = req.body.lastName || aText[1];
    var newPerson = {
      firstName: firstName,
      lastName: lastName
    }
    var newTTStats = {wins: 0, loses: 0, elo: 400};
    var newPoolStats = {wins: 0, loses: 0, elo: 400};
    Person.create(newPerson, (err, newlyCreatedPerson) => {
        if (err) {
          console.log(err);
        } else {
          var TTPromise = TTStats.create(newTTStats);
          var poolPromise = PoolStats.create(newPoolStats);
          TTPromise.then((newlyCreatedTTStats) => {
              newlyCreatedTTStats.person = newlyCreatedPerson;
              newlyCreatedTTStats.firstName = newlyCreatedPerson.firstName;
              newlyCreatedTTStats.lastName = newlyCreatedPerson.lastName;
              newlyCreatedTTStats.save((err) => {
                if (err) {
                  console.log("ERROR SAVING TTstats");
                }
              });
              newlyCreatedPerson.TTStats = newlyCreatedTTStats;
          });
          poolPromise.then((newlyCreatedPoolStats) => {
              newlyCreatedPoolStats.person = newlyCreatedPerson;
              newlyCreatedPoolStats.firstName = newlyCreatedPerson.firstName;
              newlyCreatedPoolStats.lastName = newlyCreatedPerson.lastName;
              newlyCreatedPoolStats.save((err) => {
                if (err) {
                  console.log("ERROR SAVING POOLSTATS");
                }
              });
              newlyCreatedPerson.PoolStats = newlyCreatedPoolStats;
          });
          Promise.all([TTPromise, poolPromise]).then(() => {
            newlyCreatedPerson.save((err) => {
                if (err) {
                  console.log(err);
                }
                res.set({
                  'Content-Type': 'application/json'
                });
                res.status(200).send({'text': "Welcome" + " " + newlyCreatedPerson.firstName + " you were entered into the rankings!" + " Check https://internpoolranking.herokuapp.com/ for current rankings!"});
            });
          }).catch((err) => {
            console.log(err);
          });
        }
      });
  }
});

router.post("/change", (req, res) => {
  if (req.body.channel_name != "pool-ranking") {
    res.set({
      'Content-Type': 'application/json'
    });
    res.status(200).send({'text': 'Sorry, you need to be in the pool-ranking channel to run this command'})
  } else {
    if (req.body.text) {
       aText = req.body.text.split(" ");
    }
    var sWinnerFirstName = req.body.winnerFirstName || aText[0];
    var sWinnerLastName = req.body.winnerLastName || aText[1];
    var sLoserFirstName = req.body.loserFirstName || aText[2];
    var sLoserLastName = req.body.loserLastName || aText[3];
    var bIsPool = req.body.isPool || aText[4] === "pool";
    Person.find({firstName: sWinnerFirstName, lastName: sWinnerLastName}, (err, foundWinner) => {
      Person.find({firstName: sLoserFirstName, lastName: sLoserLastName}, (err, foundLoser) => {
        var elo = new Elo();
        var winnerPoolStatsId = foundWinner[0].PoolStats;
        var winnerTTStatsId = foundWinner[0].TTStats;
        var loserPoolStatsId = foundLoser[0].PoolStats;
        var loserTTStatsId = foundLoser[0].TTStats;
        if (bIsPool) {
          PoolStats.findById(winnerPoolStatsId, (err, foundWinnerPoolStats) => {
            PoolStats.findById(loserPoolStatsId, (err, foundLoserPoolStats) => {
              var aUpdatedScores = elo.updateScores(foundWinnerPoolStats, foundLoserPoolStats);
              foundWinnerPoolStats.wins++;
              foundWinnerPoolStats.elo = aUpdatedScores[0];
              foundLoserPoolStats.loses++;
              foundLoserPoolStats.elo = aUpdatedScores[1];
              foundWinnerPoolStats.save((err) => {
                if (err) {
                  console.log(err);
                }
              });
              foundLoserPoolStats.save((err) => {
                if (err) {
                  console.log(err);
                }
                res.set({
                  'Content-Type': 'application/json'
                });
                res.status(200).send({'text': "Got it, " + aText[0] + " beat " + aText[2] + " in " + aText[4] + ". Check https://internpoolranking.herokuapp.com/ for current rankings!"});
                res.end();
              });
            });
          });
        } else {
          TTStats.findById(winnerTTStatsId, (err, foundWinnerTTStats) => {
            TTStats.findById(loserTTStatsId, (err, foundLoserTTStats) => {
              var aUpdatedScores = elo.updateScores(foundWinnerTTStats, foundLoserTTStats);
              foundWinnerTTStats.wins++;
              foundWinnerTTStats.elo = aUpdatedScores[0];
              foundLoserTTStats.loses++;
              foundLoserTTStats.elo = aUpdatedScores[1];
              foundWinnerTTStats.save((err) => {
                if (err) {
                  console.log(err);
                }
              });
              foundLoserTTStats.save((err) => {
                if (err) {
                  console.log(err);
                }
                res.set({
                  'Content-Type': 'application/json'
                });
                res.status(200).send({'text': "Got it, " + aText[0] + " beat " + aText[2] + " in " + aText[4] + ". Check https://internpoolranking.herokuapp.com/ for current rankings!"});
                res.end();
              });
            });
          });
        }
      });
    });
  }
});
module.exports = router;
