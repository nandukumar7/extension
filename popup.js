document.addEventListener('DOMContentLoaded', () => {
    const statusMessageEl = document.getElementById('status-message');
    const scoreDisplayEl = document.getElementById('score-display');
    const visualAlertEl = document.getElementById('visual-alert');

    function updateUI(data) {
        if (!data || !data.type) {
            statusMessageEl.textContent = 'Waiting for video...';
            return;
        }

        switch (data.type) {
            case 'ANALYSIS_RUNNING':
                statusMessageEl.textContent = 'Analysis in Progress';
                updateScore(data.score);
                break;
            case 'ANALYSIS_STOPPED':
                statusMessageEl.textContent = 'Analysis Paused or Ended';
                scoreDisplayEl.textContent = '-';
                visualAlertEl.className = '';
                break;
            case 'NO_VIDEO':
                 statusMessageEl.textContent = 'No active analysis';
                 scoreDisplayEl.textContent = '-';
                 visualAlertEl.className = '';
                 break;
            default:
                statusMessageEl.textContent = 'Idle';
        }
    }
    
    function updateScore(score) {
        const percentage = (score * 100).toFixed(1);
        scoreDisplayEl.textContent = `${percentage}%`;
        
        visualAlertEl.className = '';
        scoreDisplayEl.className = '';

        if (score > 0.75) {
            visualAlertEl.classList.add('sync-good');
            scoreDisplayEl.classList.add('sync-good');
        } else if (score > 0.5) {
            visualAlertEl.classList.add('sync-medium');
            scoreDisplayEl.classList.add('sync-medium');
        } else {
            visualAlertEl.classList.add('sync-bad');
            scoreDisplayEl.classList.add('sync-bad');
        }
    }

    chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
        updateUI(response);
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'STATUS_UPDATE') {
            updateUI(message.data);
        }
    });
});

