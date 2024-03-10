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
initializeDBAndServer()
//  Returns a list of all movie names in the movie table
const listOfAllMovieName = movieName => {
  return {
    movieName: movieName.movie_name,
  }
}

// Get list of Movies
app.get('/movies', async (request, response) => {
  const getMoviesQuery = `
  SELECT * FROM movie WHERE movie_id;
  `
  const movieList = await db.all(getMoviesQuery)
  const responseObject = movieList.map(listOfAllMovieName)
  response.send(responseObject)
})

// Post Adding a movie Details
app.post('/movies', async (request, response) => {
  const movieDetails = request.body
  const {movieName, directorId, leadActor} = movieDetails

  const postMovie = `
    INSERT INTO movie (movie_name, director_id, lead_actor)
    VALUES (?, ?, ?);
  `
  await db.run(postMovie, [movieName, directorId, leadActor])
  response.send('Movie Successfully Added')
})

// conconvertResponseObjectToObject
const convertResponseObjectToObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

// Get particular movie
app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getMovieDetails = `
    SELECT *
    FROM movie
    WHERE movie_id = '${movieId}';
  `
  const movie = await db.get(getMovieDetails)
  response.send(convertResponseObjectToObject(movie))
})

// Update using putMethod
app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const {movieName, directorId, leadActor} = request.body
  const updateMovieById = `
    UPDATE movie
    SET movie_name = ?, director_id = ?, lead_actor = ?
    WHERE movie_id = ?;
  `
  await db.run(updateMovieById, [movieName, directorId, leadActor, movieId])
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

// convertDirectorSnake_CaceToCamel_Came
const convertDbObjectToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

// Get list of directors
app.get('/directors', async (request, response) => {
  const getListDirectors = `
    SELECT * 
    FROM director;
  `
  const directors = await db.all(getListDirectors)
  response.send(directors.map(convertDbObjectToResponseObject))
})
const getmovieByDirctorId = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}
// Get movies by a particular director ID
app.get('/directors/:directorId/movies', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMovies = `
    SELECT movie_name
    FROM movie
    WHERE director_id = ${directorId};
    ;
  `
  const movies = await db.all(getDirectorMovies)
  response.send(movies.map(getmovieByDirctorId))
})

module.exports = app
