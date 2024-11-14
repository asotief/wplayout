document.addEventListener("DOMContentLoaded", () => {
    const videoUpload = document.getElementById('videoUpload');
    const playlistContainer = document.getElementById('playlistContainer');
    const previewPlayer = document.getElementById('previewPlayer');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoTitle = document.getElementById('videoTitle');
    const videoDuration = document.getElementById('videoDuration');
    const startPlaylistButton = document.getElementById('startPlaylist');
    const nextVideoButton = document.getElementById('nextVideo');
    const clearPlaylistButton = document.getElementById('clearPlaylist');
    const stopButton = document.getElementById('stopButton');
    const digitalClock = document.getElementById('digitalClock');
    const broadcastChannel = new BroadcastChannel('video_channel');

    let playlist = [];
    let currentVideoIndex = 0;
    let nextVideoIndex = 1;
    let selectedVideoIndex = null;
    let startTime = null;
    let isPlaying = false;

    // Atualiza o relógio digital
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        digitalClock.textContent = `${hours}:${minutes}:${seconds}`;
    }
    setInterval(updateClock, 1000);

    // Remove um vídeo da playlist
    function removeVideo(index) {
        playlist.splice(index, 1);
        if (selectedVideoIndex === index) {
            selectedVideoIndex = null;
        }
        updatePlaylist();
    }

    // Adiciona vídeos à playlist
    videoUpload.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const url = URL.createObjectURL(file);
            const videoElement = document.createElement("video");
            videoElement.src = url;

            videoElement.addEventListener('loadeddata', () => {
                videoElement.currentTime = 2;
                videoElement.addEventListener('seeked', () => {
                    const thumbnail = generateThumbnail(videoElement);
                    playlist.push({
                        name: file.name,
                        url: url,
                        duration: videoElement.duration,
                        thumbnail: thumbnail,
                        played: false
                    });
                    updatePlaylist();
                }, { once: true });
            });
        });
    });

    // Gera miniatura do vídeo
    function generateThumbnail(videoElement) {
        const canvas = document.createElement("canvas");
        canvas.width = 160;
        canvas.height = 90;
        const context = canvas.getContext("2d");
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL();
    }

   //NNNNNNNNNNNNNNNNNNNNNNN
   
// Atualiza a playlist e exibe a hora de início de cada vídeo

  function updatePlaylist() {
    playlistContainer.innerHTML = "";
    let cumulativeTime = startTime ? new Date(startTime) : new Date(); // Início da playlist

    playlist.forEach((video, index) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'align-items-center', 'justify-content-between');

        // Define as classes para os estados dos vídeos
        if (index === currentVideoIndex && isPlaying) {
            li.classList.add('playing');
        } else if (index === selectedVideoIndex) {
            li.classList.add('selected');
        } else if (video.played) {
            li.classList.add('played');
        }

        const videoInfo = document.createElement('div');
        const thumbnailImg = document.createElement('img');
        thumbnailImg.src = video.thumbnail;
        thumbnailImg.width = 80;
        thumbnailImg.classList.add('mr-2');
        videoInfo.appendChild(thumbnailImg);

        // Formata o tempo de início e cria um elemento <span> para estilizar apenas o texto de tempo
        const startTimeString = cumulativeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const videoNameText = document.createTextNode(video.name + " ");
        
        // Cria o elemento de tempo com a classe `start-time` para estilização
        const startTimeElement = document.createElement('span');
        startTimeElement.classList.add('start-time');  // Classe para estilo específico
        startTimeElement.textContent = `▶\u0020 ${startTimeString}`;   //original=//  startTimeElement.textContent = `Início: ${startTimeString}`;

        videoInfo.appendChild(videoNameText);
        videoInfo.appendChild(startTimeElement);  // Adiciona o tempo estilizado

        li.appendChild(videoInfo);

        // Atualiza o tempo cumulativo para o próximo vídeo
        cumulativeTime.setSeconds(cumulativeTime.getSeconds() + video.duration);

      // Botão de exclusão com ícone
const deleteButton = document.createElement('button');
deleteButton.classList.add('btn', 'btn-danger', 'ml-2');

// Cria o ícone de lixeira
const trashIcon = document.createElement('i');
trashIcon.classList.add('fas', 'fa-trash');  // Usa o ícone de lixeira do Font Awesome

// Adiciona o ícone ao botão
deleteButton.appendChild(trashIcon);

// Evento de clique
deleteButton.addEventListener('click', () => {
    URL.revokeObjectURL(video.url);
    removeVideo(index);
});

li.appendChild(deleteButton);


        // Ação ao clicar no item
        li.addEventListener('click', () => {
            previewPlayer.src = video.url;
            previewPlayer.play();
        });

        playlistContainer.appendChild(li);
    });
}





 document.addEventListener('DOMContentLoaded', function () {
        const rodape = document.querySelector('.rodape-seguranca');

        if (!rodape || rodape.textContent.indexOf('Playout W') === -1) {
            document.body.innerHTML = '<h1 style="color: red; text-align: center;">Página bloqueada: rodapé ausente ou alterado!</h1>';
        }
    });



    // Reproduz o vídeo atual com base no índice
    function playVideo(index) {
        if (!playlist.length) return;

        const video = playlist[index];
        currentVideoIndex = index;
        selectedVideoIndex = null;
        isPlaying = true;

        video.played = true;
        videoPlayer.src = video.url;
        videoPlayer.play();
        videoTitle.textContent = video.name;

        videoPlayer.onloadedmetadata = () => {
            videoDuration.textContent = formatTime(videoPlayer.duration);
        };

        broadcastChannel.postMessage({
            action: 'play',
            videoUrl: video.url,
            currentTime: videoPlayer.currentTime
        });

        autoPlay();
        updatePlaylist();
    }

    // Formata o tempo do vídeo em minutos e segundos
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Auto-play do próximo vídeo na ordem atualizada
    function autoPlay() {
        videoPlayer.onended = () => {
            currentVideoIndex = (currentVideoIndex + 1) % playlist.length;
            playVideo(currentVideoIndex);
        };
    }

    // Inicia a playlist
    startPlaylistButton.addEventListener('click', () => {
        if (!isPlaying && playlist.length > 0) {
            startTime = new Date();
            currentVideoIndex = 0;
            nextVideoIndex = 1;
            playVideo(currentVideoIndex);
        }
    });

    // Próximo vídeo
    nextVideoButton.addEventListener('click', () => {
        currentVideoIndex = (currentVideoIndex + 1) % playlist.length;
        nextVideoIndex = (currentVideoIndex + 1) % playlist.length;
        playVideo(currentVideoIndex);
    });

    // Limpar playlist
    clearPlaylistButton.addEventListener('click', () => {
        playlist = [];
        updatePlaylist();
        videoPlayer.src = "";
        videoTitle.textContent = "Nenhum vídeo";
        videoDuration.textContent = "0:00";
        isPlaying = false;
    });

    // Parar reprodução
stopButton.addEventListener('click', () => {
    if (isPlaying) {
        videoPlayer.pause();
        isPlaying = false;

        // Envia comando de parar para o program.html
        broadcastChannel.postMessage({
            action: 'stop'
        });
    }
});

// ***Exemplo para um botão de pause (se necessário)** //
//  pauseButton.addEventListener('click', () => {
 //   if (isPlaying) {
 //       videoPlayer.pause();
 //       isPlaying = false;

        // ****Envia comando de pause para o program.html****//
 //       broadcastChannel.postMessage({
//            action: 'pause'
//        });
 //   }
//  });


    // Configuração do VU Meter para cada player
    function setupVUMeter(player, meterId) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        player.addEventListener('play', () => {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
        });

        const source = audioContext.createMediaElementSource(player);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function updateMeter() {
            analyser.getByteFrequencyData(dataArray);
            setTimeout(() => {
                requestAnimationFrame(updateMeter);
            }, 100);

            const volume = dataArray.reduce((b, a) => b + a) / bufferLength;
            const bars = document.querySelectorAll(`#${meterId} .bar`);
            const level = Math.floor((volume / 100) * bars.length);

            bars.forEach((bar, index) => {
                if (index < level) {
                    bar.style.height = `${Math.random() * 170}%`;
                    bar.style.backgroundColor = index < bars.length / 5 ? '#00ff00' :
                                                index < (20 * bars.length) / 5 ? '#ffcc00' : '#ff4444';
                } else {
                    bar.style.height = level === bars.length ? '2%' : '0%';
                    bar.style.backgroundColor = '#ff4444';
                }
            });
        }

        updateMeter();
    }

    setupVUMeter(previewPlayer, 'previewMeter');
    setupVUMeter(videoPlayer, 'mainMeter');

    // Função para mover itens da playlist usando Sortable.js
    const sortable = new Sortable(playlistContainer, {
        animation: 50,
        onEnd: function(evt) {
            // Atualiza a ordem da playlist ao mover
            const movedItem = playlist.splice(evt.oldIndex, 1)[0];
            playlist.splice(evt.newIndex, 0, movedItem);

            // Ajusta o índice do vídeo atual se o vídeo movido for o que está tocando
            if (evt.oldIndex === currentVideoIndex) {
                currentVideoIndex = evt.newIndex;
            } else if (evt.oldIndex < currentVideoIndex && evt.newIndex >= currentVideoIndex) {
                currentVideoIndex -= 1;
            } else if (evt.oldIndex > currentVideoIndex && evt.newIndex <= currentVideoIndex) {
                currentVideoIndex += 1;
            }

            updatePlaylist();
        }
    });
});
