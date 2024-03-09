const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

// initializeDBAndServer
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer(
})

// Post Adding a movie Details
app.post('/movies', async (request, response) => {
  const movieDetails = request.body
  const {movie_name, director_id, lead_actor} = movieDetails

  const postMovie = `
    INSERT INTO movie (movie_name, director_id, lead_actor)
    VALUES (?, ?, ?);
  `
  await db.run(postMovie, [movie_name, director_id, lead_actor])
  response.send('Movie Successfully Added')
})

// Get particular movie
app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getMovieDetails = `
    SELECT *
    FROM movie
    WHERE movie_id = '${movieId}';
  `
  const movie = await db.get(getMovieDetails)
  response.send(movie)
})

// Update using putMethod
app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const {movie_name, director_id, lead_actor} = request.body
  const updateMovieById = `
    UPDATE movie
    SET movie_name = ?, director_id = ?, lead_actor = ?
    WHERE movie_id = ?;
  `
  await db.run(updateMovieById, [movie_name, director_id, lead_actor, movieId])
  response.send('Movie Details Updated')
})

// Delete movie By Id
app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const deleteMovie = `
    DELETE FROM movie
    WHERE movie_id = ?;
  `
  await db.run(deleteMovie, [movieId])
  response.send('Movie Removed')
})

// Get list of directors
app.get('/directors', async (request, response) => {
  const getListDirectors = `
    SELECT * 
    FROM director;
  `
  const directors = await db.all(getListDirectors)
  response.send(directors)
})

// Get movies by a particular director ID
app.get('/directors/:directorId/movies', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMovies = `
    SELECT movie_name
    FROM movie
    WHERE director_id = ?;
  `
  const movies = await db.all(getDirectorMovies, [directorId])
  response.send(movies)
})

module.exports = app
