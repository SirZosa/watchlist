const request = indexedDB.open("watchlist", 1)
let db = null


request.onupgradeneeded = function(e){
    db = e.target.result
    const movieList =  db.createObjectStore("movie_list", {keyPath: "imdbID"})
}

request.onsuccess = function(e){
    db = e.target.result
    checkDB()
}

request.onerror = function(e){
    alert("errorrrrrr")
}



function checkDB(){

    const tx = db.transaction("movie_list", "readonly")
    const mAdd = tx.objectStore("movie_list")
    const request = mAdd.openCursor()
    request.onsuccess = function(e){
        const cursor = e.target.result

        if(cursor){
        watchList.push(cursor.value)
        cursor.continue()
    }
}
}

document.getElementById('search-btn').addEventListener('click', searchFunction)

const searchedMovies = []
let watchList = []

function searchFunction(){
    movie = document.getElementById('search-bar').value
    document.getElementById('search-bar').value = ""
fetch(`https://www.omdbapi.com/?s=${movie}&apikey=71d8596f`)
    .then(response => response.json())
    .then(data => imdbID(data))
}

function imdbID(data){
    document.getElementById('movies-render').innerHTML = ""
    for(let info of data.Search){
        const title = info.Title
        fetch(`https://www.omdbapi.com/?t=${title}&apikey=71d8596f`)
        .then(response => response.json())
        .then(data => render(data))
    }
}

document.addEventListener('click', function(e){
    if(e.target.dataset.add){
        const addedMovie = searchedMovies.filter(function(movie){
            return movie.imdbID === e.target.dataset.add
        })
        if(addedMovie[0].added === false){
        watchList.push(addedMovie)
        const tx = db.transaction("movie_list", "readwrite")
        const mAdd = tx.objectStore("movie_list")
        const addedMovieObj = Object.assign({}, addedMovie)
        addedMovie[0].added = true
        mAdd.add(addedMovieObj[0])
        e.target.disabled = true
        e.target.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#00ff00;"></i> added`
        }
        else{
            alert("Movie already added")
        }
    }
})


function render(data){
    const movieInfo = {
        Title: data.Title,
        imdbRating: data.imdbRating,
        Duration: data.Runtime,
        Genre: data.Genre,
        Plot: data.Plot,
        Poster: data.Poster,
        imdbID: data.imdbID,
        added: false
    }

    searchedMovies.push(movieInfo)

    document.getElementById('movies-render').innerHTML += `
    <div class="items">
                <img class="poster" src="${movieInfo.Poster}" onerror="this.src='img/movie-cover.webp'" alt="example">
                <div class="movie-info">
                    <div class="title">
                        <h3>${movieInfo.Title}</h3>
                        <i class="fa-solid fa-star" style="color: #f6fa00;"></i>
                        <p>${movieInfo.imdbRating}</p>
                    </div>
                    <div class="info">
                        <p>${movieInfo.Duration}</p>
                        <p>${movieInfo.Genre}</p>
                        <button class="add" data-add="${movieInfo.imdbID}"><i class="fa-solid fa-circle-plus" style="color: #ffffff;"></i> add</button>
                    </div>
                    <div class="description"><p>${movieInfo.Plot}</p></div>
                    </div>
                </div>
                
    `
}