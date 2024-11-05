document.addEventListener("DOMContentLoaded", () => {
    const programPlayer = document.getElementById('programPlayer');
    const programMeter = document.getElementById('programMeter');

    // Configura o VU Meter
    function setupVUMeter(player, meterId) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Suspende o AudioContext até o player começar a tocar
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

            const volume = dataArray.reduce((b, a) => b + a) / bufferLength;
            const bars = document.querySelectorAll(`#${meterId} .bar`);
            const level = Math.floor((volume / 100) * bars.length);

            bars.forEach((bar, index) => {
                if (index < level) {
                    bar.style.height = `${Math.random() * 170}%`;
                    bar.style.backgroundColor = index < bars.length / 5 ? '#00ff00' : index < (20 * bars.length) / 5 ? '#ffcc00' : '#ff4444';
                } else {
                    bar.style.height = '0%';
                }
            });

            requestAnimationFrame(updateMeter);
        }

        updateMeter();
    }

    setupVUMeter(programPlayer, 'programMeter');

    // Sincronizar o player com a playlist do index.html
    window.addEventListener('message', (event) => {
        if (event.data.action === 'playVideo') {
            const videoUrl = event.data.videoUrl;
            programPlayer.src = videoUrl;
            programPlayer.play();
        }
    });
});
