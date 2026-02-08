console.log("Deepfake Detector: Content script loaded for meeting page.");

function injectLibraries() {
    const libs = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js',
        'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core',
        'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter',
        'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl'
    ];
    libs.forEach(src => {
        if (document.querySelector(`script[src="${src}"]`)) return;
        const script = document.createElement('script');
        script.src = src;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
    });
}

function injectUI() {
    if (document.getElementById('deepfake-detector-btn')) return;

    const button = document.createElement('button');
    button.id = 'deepfake-detector-btn';
    button.textContent = 'Start Lip-Sync Analysis';
    document.body.appendChild(button);

    button.addEventListener('click', async () => {
        try {
            button.textContent = 'Requesting Permission...';
            button.disabled = true;

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: "tab" },
                audio: true,
            });

            button.textContent = 'Initializing Analysis...';
            console.log("Deepfake Detector: Permission granted. Stream captured.");

            const video = document.createElement('video');
            video.srcObject = stream;
            video.muted = true;
            video.play().catch(e => console.error("Error playing hidden video:", e));

            const { initializeSyncEngine } = await import(chrome.runtime.getURL('sync_engine.js'));
            initializeSyncEngine(video);

            button.textContent = 'Analysis Running';
            button.classList.remove('error');
            button.classList.add('running');

        } catch (err) {
            console.error("Deepfake Detector Error:", err.name, err.message);
            button.textContent = 'Permission Denied (Click to retry)';
            button.disabled = false;
            button.classList.add('error');
            
            chrome.runtime.sendMessage({
                type: 'STATE_UPDATE',
                data: { type: 'ANALYSIS_STOPPED' }
            });
        }
    });
}

injectLibraries();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectUI);
} else {
    injectUI();
}

