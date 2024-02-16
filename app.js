const express = require('express')
const app = express()
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
app.use(express.json())

let db = null
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Started')
    })
  } catch (e) {
    console.log(e.message)
  }
}

initializeDBAndServer()

app.get('/players/', async (request, response) => {
  try {
    const playersQuerry = `SELECT player_id as playerId, player_name as playerName FROM player_details`
    const players = await db.all(playersQuerry)
    response.send(players)
  } catch (e) {
    console.log(e)
  }
})

app.get('/players/:playerId/', async (request, response) => {
  try {
    const {playerId} = request.params
    const playerQuerry = `SELECT player_id as playerId, player_name as playerName FROM player_details WHERE player_id = ${playerId}`
    const player = await db.get(playerQuerry)
    response.send(player)
  } catch (e) {
    console.log(e)
  }
})

app.put('/players/:playerId/', async (request, response) => {
  try {
    const {playerId} = request.params
    const {playerName} = request.body
    const updatePlayerQuerry = `UPDATE player_details SET player_name = '${playerName}' WHERE player_id = ${playerId}`
    await db.run(updatePlayerQuerry)
    response.send('Player Details Updated')
  } catch (e) {
    console.log(e)
  }
})

app.get('/matches/:matchId/', async (request, response) => {
  try {
    const {matchId} = request.params
    const matchQuerry = `SELECT match_id as matchId, match, year FROM match_details WHERE match_id = ${matchId}`
    const match = await db.get(matchQuerry)
    response.send(match)
  } catch (e) {
    console.log(e)
  }
})

app.get('/players/:playerId/matches', async (request, response) => {
  try {
    const {playerId} = request.params
    const matchIdsQuerry = `SELECT match_id FROM player_match_score WHERE player_id = ${playerId}`
    const matchIdArray = await db.all(matchIdsQuerry)
    const arr = matchIdArray.map(eachItem => eachItem.match_id)
    const matchsOfPlayerQuerry = `SELECT match_id as matchId, match, year FROM match_details WHERE match_id IN (${arr})`
    const matchsOfPlayer = await db.all(matchsOfPlayerQuerry)
    response.send(matchsOfPlayer)
  } catch (e) {
    console.log(e)
  }
})

app.get('/matches/:matchId/players/', async (request, response) => {
  try {
    const {matchId} = request.params
    // const playersIdQuerry = `SELECT player_id FROM player_match_score WHERE match_id = ${matchId}`
    // const playersIdArray = await db.all(playersIdQuerry)
    // const arr1 = playersIdArray.map(eachItem => eachItem.player_id)
    // const playersOfMatchQuerry = `SELECT player_id as playerId, player_name as playerName FROM player_details WHERE player_id IN (${arr1})`
    // const playersOfMatch = await db.all(playersOfMatchQuerry)
    const plQuerry = `SELECT player_details.player_id as playerID, player_details.player_name as playerName FROM player_match_score NATURAL JOIN player_details WHERE match_id = ${matchId}`
    const pl = await db.all(plQuerry)
    response.send(pl)
  } catch (e) {
    console.log(e)
  }
})

app.get('/players/:playerId/playerScores', async (request, response) => {
  try {
    const {playerId} = request.params
    const playerScoresQuerry = `SELECT SUM(score) as totalScore, SUM(fours) as totalFours, SUM(sixes) as totalSixes FROM player_match_score WHERE player_id = ${playerId}`
    const playerScores = await db.get(playerScoresQuerry)
    const playerDetailsQuerry = `SELECT * FROM player_details WHERE player_id = ${playerId}`
    const playerDetails = await db.get(playerDetailsQuerry)
    const {player_id, player_name} = playerDetails
    const {totalScore, totalFours, totalSixes} = playerScores
    // const playerScoreTableQuerry = `SELECT * FROM player_match_score WHERE match_id = 10`
    // const playerScoreTable = await db.all(playerScoreTableQuerry)
    // console.log(playerScoreTable)
    response.send({
      playerId: player_id,
      playerName: player_name,
      totalScore: totalScore,
      totalFours: totalFours,
      totalSixes: totalSixes,
    })
  } catch (e) {
    console.log(e)
  }
})

module.exports = app
