export function initializeSyncEngine(videoElement) {
    const waitForLibs = setInterval(() => {
        if (window.FaceMesh && window.tf) {
            clearInterval(waitForLibs);
            runAnalysis(videoElement);
        }
    }, 100);

}
async function runAnalysis(videoElement) {
    console.log("Sync Engine: Initializing...");
    if (!videoElement) {
        console.error("Sync Engine: No video element provided.");
        return;
    }

    let isProcessing = false;
    let audioContext, analyser, dataArray;

    const avffModel = {
        predict: (lipMovement, audioLevel) => {
            const noise = (Math.random() - 0.5) * 0.1;
            if (audioLevel < 0.05 && lipMovement < 0.05) return 0.9 + noise;
            const sync = 1.0 - Math.abs(lipMovement - audioLevel);
            return Math.max(0, Math.min(1, sync + noise));
        }
    };
    console.log("Sync Engine: Simulated AVFF model loaded.");

    const faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });
    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
    });
    faceMesh.onResults(onFaceMeshResults);
    console.log("Sync Engine: FaceMesh model loaded.");

    function setupAudioAnalysis() {
        if (audioContext) return;
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaElementSource(videoElement);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            console.log("Sync Engine: Audio context ready.");
        } catch (e) {
            console.error("Sync Engine: Could not set up audio context.", e);
        }
    }

    function onFaceMeshResults(results) {
        if (!isProcessing || !results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            return;
        }
        const landmarks = results.multiFaceLandmarks[0];
        const upperLip = landmarks[13];
        const lowerLip = landmarks[14];
        const distance = Math.hypot(upperLip.x - lowerLip.x, upperLip.y - lowerLip.y, upperLip.z - lowerLip.z);
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        const faceWidth = Math.hypot(leftEye.x - rightEye.x, leftEye.y - rightEye.y, leftEye.z - rightEye.z);
        const lipMovement = (distance / faceWidth) * 5;

        analyser.getByteFrequencyData(dataArray);
        const audioLevel = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length / 128;

        const syncScore = avffModel.predict(lipMovement, audioLevel);
        
        chrome.runtime.sendMessage({
            type: 'SYNC_UPDATE',
            data: { type: 'ANALYSIS_RUNNING', score: syncScore }
        });
    }

    async function processVideo() {
        if (videoElement.paused || videoElement.ended || !isProcessing) return;
        await faceMesh.send({ image: videoElement });
        requestAnimationFrame(processVideo);
    }

    console.log("Sync Engine: Starting analysis.");
    setupAudioAnalysis();
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    isProcessing = true;
    processVideo();

    videoElement.srcObject.getVideoTracks()[0].onended = () => {
        console.log("Sync Engine: Stream ended.");
        isProcessing = false;
        const button = document.getElementById('deepfake-detector-btn');
        if (button) {
            button.textContent = 'Analysis Ended (Click to restart)';
            button.disabled = false;
            button.classList.remove('running');
        }
        chrome.runtime.sendMessage({
            type: 'STATE_UPDATE',
            data: { type: 'ANALYSIS_STOPPED' }
        });
    };
}

