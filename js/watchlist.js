const request = indexedDB.open("watchlist", 1)

let db = null
let watchList = []

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
    else{
        renderWatchlist(watchList)
    }
}
}

document.addEventListener('click', function(e){
if (e.target.dataset.remove){
    const filteredArray = watchList.findIndex(function(obj){
        return obj.imdbID === e.target.dataset.remove
    })
    const tx = db.transaction("movie_list", "readwrite")
    const mAdd = tx.objectStore("movie_list")
    mAdd.delete(watchList[filteredArray].imdbID)
    watchList.splice(filteredArray,1)
    renderWatchlist(watchList)
    if (watchList.length === 0){
            document.getElementById("watchList-render").innerHTML = 
            `
            <div class="no-search">
                <i class="fa-solid fa-film" style="color: #323232;"></i>
                <p>Start adding</p>
                </div>
            `
        }
    }
})

function renderWatchlist(data){
    document.getElementById("watchList-render").innerHTML = ""
    for(let movieInList of data){
        const movieInfo = {
            Title: movieInList.Title,
            imdbRating: movieInList.imdbRating,
            Duration: movieInList.Duration,
            Genre: movieInList.Genre,
            Plot: movieInList.Plot,
            Poster: movieInList.Poster,
            imdbID: movieInList.imdbID
        }
    document.getElementById("watchList-render").innerHTML += `
    <div class="items">
                <img class="poster" src="${movieInfo.Poster}" onerror="this.src='img/movie-cover.webp'" alt="example" alt="example">
                <div class="movie-info">
                    <div class="title">
                        <h3>${movieInfo.Title}</h3>
                        <i class="fa-solid fa-star" style="color: #f6fa00;"></i>
                        <p>${movieInfo.imdbRating}</p>
                    </div>
                    <div class="info">
                        <p>${movieInfo.Duration}</p>
                        <p>${movieInfo.Genre}</p>
                        <p class="add" data-remove="${movieInfo.imdbID}"><i class="fa-solid fa-circle-minus" style="color: #ffffff;"></i> Remove</p>
                    </div>
                    <div class="description"><p>${movieInfo.Plot}</p></div>
                    </div>
                </div>
                
    `
}
}
