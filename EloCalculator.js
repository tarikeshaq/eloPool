module.exports = class Elo {
  updateScores(oWinnerStats, oLoserStats) {
    var iWinnerGamesPlayed = oWinnerStats.wins + oWinnerStats.loses;
    var iLoserGamesPlayed = oLoserStats.wins + oLoserStats.loses;
    var iWinnerPrevElo = oWinnerStats.elo;
    var iLoserPrevElo = oLoserStats.elo;
    let getConstant = (iGamesPlayed, iPrevElo) => {
      return iGamesPlayed < 30 && iPrevElo < 2300 ? 40 :
              iPrevElo < 2400 ? 20 : 10;
    };
    var winnerConstant = getConstant(iWinnerGamesPlayed, iWinnerPrevElo);
    var loserConstant = getConstant(iLoserGamesPlayed, iLoserPrevElo);
    let getProbabilityOfWinning = (elo1, elo2) => {
      return 1.0 * 1.0 / (1 + 1.0 *
              Math.pow(10, 1.0 * (elo1 - elo2) / 400));
    };
    let updateEloScores = (iWinnerGamesPlayed, iWinnerPrevElo, winnerConstant, iLoserGamesPlayed, iLoserPrevElo, loserConstant) => {
      var winnerProbablity = getProbabilityOfWinning(iWinnerPrevElo, iLoserPrevElo);
      var loserProbablity = getProbabilityOfWinning(iLoserPrevElo, iWinnerPrevElo);
      var iWinnerNewElo = iWinnerPrevElo + winnerConstant * (1 - winnerProbablity);
      var iLoserNewElo = iLoserPrevElo + loserConstant * (0 - loserProbablity);
      return [iWinnerNewElo, iLoserNewElo];
    };
    return updateEloScores(iWinnerGamesPlayed, iWinnerPrevElo, winnerConstant, iLoserGamesPlayed, iLoserPrevElo, loserConstant);
  }
}
