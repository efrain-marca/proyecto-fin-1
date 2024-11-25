// Variables globales
let videoList = [];  // Esto guarda los videos seleccionados
const playlist = []; // Aquí se almacenarán los videos de la playlist
let currentIndex = 0; // Índice del video actual en la playlist
let isPlaying = false; // Estado de la reproducción (si está en play o pause)

// Elementos del DOM
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const videoResults = document.getElementById('video-results');
const prevBtn = document.getElementById('prev-btn');
const playPauseBtn = document.getElementById('play-pause-btn');
const nextBtn = document.getElementById('next-btn');
const videoPlayer = document.getElementById('video-player');
const playlistContainer = document.getElementById('playlist-container');
const savePlaylistBtn = document.getElementById('save-playlist-btn');
const deleteBtn = document.getElementById('delete-btn');


// Función para buscar videos en YouTube usando la API de YouTube Data API v3
function searchVideos(query) {
    const API_KEY = 'AIzaSyAOOiMLLb0oQT6VNcp_AtchV2HdZK7Kqk8'; // Reemplaza con tu clave de API
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&key=${API_KEY}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.items) {
                displayVideoResults(data.items);
            } else {
                videoResults.innerHTML = 'No videos found.';
            }
        })
        .catch(error => {
            console.error('Error fetching YouTube data:', error);
        });
}

// Función para mostrar los resultados de búsqueda en la interfaz
function displayVideoResults(videos) {
    videoResults.innerHTML = ''; // Limpiar resultados anteriores
    videos.forEach(video => {
        const videoElement = document.createElement('div');
        videoElement.classList.add('video-item');
        videoElement.innerHTML = `
            <img src="${video.snippet.thumbnails.high.url}" alt="${video.snippet.title}">
            <h3>${video.snippet.title}</h3>
            <button class="add-to-playlist-btn" data-video-id="${video.id.videoId}">Add to Playlist</button><br><br>
        `;
        videoResults.appendChild(videoElement);
    });

    // Añadir eventos a los botones de "Add to Playlist"
    const addButtons = document.querySelectorAll('.add-to-playlist-btn');
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video-id');
            addToPlaylist(videoId);
        });
    });
}

// Función para agregar un video a la playlist
function addToPlaylist(videoId) {
    const videoIndex = playlist.findIndex(video => video.id === videoId);
    if (videoIndex === -1) {
        playlist.push({ id: videoId });
        updatePlaylistUI();
    }
}

// Función para actualizar la interfaz de la playlist
function updatePlaylistUI() {
    playlistContainer.innerHTML = ''; // Limpiar la lista actual
    playlist.forEach((video, index) => {
        const playlistItem = document.createElement('li');
        playlistItem.textContent = `Video ${index + 1}`;
        playlistContainer.appendChild(playlistItem);
    });
}

// Función para reproducir un video de la playlist
function playVideo(videoId) {
    const url = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    videoPlayer.src = url;
    isPlaying = true;

    // Cambiar el botón a "pausar" con el SVG
    playPauseBtn.innerHTML = `
        <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M8 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H8Zm7 0a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1Z" clip-rule="evenodd"/>
        </svg>
    `; // Cambiar el botón a "pausar"
}


// Función para reproducir el video actual de la playlist
function playCurrentVideo() {
    if (playlist.length > 0) {
        const currentVideo = playlist[currentIndex];
        playVideo(currentVideo.id);
    }
}

// Función para guardar la playlist en localStorage
function savePlaylist() {
    if (videoList.length > 0) {
        localStorage.setItem('playlist', JSON.stringify(videoList));
        alert('Playlist saved successfully!');
    } else {
        alert('No videos to save!');
    }
}

// Función para cargar videos desde localStorage (si existen)
function loadPlaylist() {
    const savedPlaylist = localStorage.getItem('playlist');
    if (savedPlaylist) {
        videoList = JSON.parse(savedPlaylist);
        displayVideos(videoList);
    }
}

// Función para mostrar los videos en la UI
function displayVideos(videos) {
    videoResults.innerHTML = ''; // Limpiar la lista de videos
    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.classList.add('video-card');
        videoCard.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}">
            <h3>${video.title}</h3>
            <button class="remove-video-btn">Remove</button>
        `;
        
        // Añadir evento para remover video específico
        const removeBtn = videoCard.querySelector('.remove-video-btn');
        removeBtn.addEventListener('click', () => removeVideo(video));
        
        videoResults.appendChild(videoCard);
    });
}

// Función para agregar un video a la lista de reproducción
function addVideoToPlaylist(video) {
    videoList.push(video);
    displayVideos(videoList);
}

// Función para eliminar un video específico de la lista
function removeVideo(videoToRemove) {
    videoList = videoList.filter(video => video !== videoToRemove);
    displayVideos(videoList);
}

// Función para eliminar todos los videos de la lista
function deleteAllVideos() {
    videoList = [];
    displayVideos(videoList);
}

// Función para eliminar un video de la playlist
function removeFromPlaylist(videoId) {
    playlist = playlist.filter(video => video.id !== videoId);
    updatePlaylistUI();
}

// Lógica para el botón de play/pause
playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        // Pausar el video que se está reproduciendo
        videoPlayer.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        isPlaying = false;
        
        // Cambiar el botón a "reproducir" con el SVG
        playPauseBtn.innerHTML = `
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z" clip-rule="evenodd"/>
            </svg>
        `; // Cambiar el botón a "reproducir" con el ícono SVG
    } else {
        // Reproducir el video actual
        playCurrentVideo();
    }
});


// Botón de "siguiente"
nextBtn.addEventListener('click', () => {
    if (playlist.length > 0) {
        currentIndex = (currentIndex + 1) % playlist.length; // Ciclo infinito
        playCurrentVideo();
    }
});

// Botón de "anterior"
prevBtn.addEventListener('click', () => {
    if (playlist.length > 0) {
        currentIndex = (currentIndex - 1 + playlist.length) % playlist.length; // Ciclo infinito hacia atrás
        playCurrentVideo();
    }
});

// Evento de búsqueda de videos
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        searchVideos(query);
    }
});

// Guardar playlist cuando el botón sea clickeado
savePlaylistBtn.addEventListener('click', savePlaylist);

// Eliminar todos los videos de la playlist cuando se hace clic en el botón de delete
deleteBtn.addEventListener('click', deleteAllVideos);

// Cargar playlist al inicio si existe en el localStorage
loadPlaylist();
