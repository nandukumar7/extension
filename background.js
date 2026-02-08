let lastStatus = { type: 'IDLE' };

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SYNC_UPDATE' || message.type === 'STATE_UPDATE') {
        lastStatus = message.data;
        chrome.runtime.sendMessage({ type: 'STATUS_UPDATE', data: lastStatus });

        if(message.data.type === 'ANALYSIS_RUNNING') {
            const score = message.data.score;
            chrome.action.setBadgeText({ text: `${Math.round(score * 100)}` });
            if (score > 0.75) {
                chrome.action.setBadgeBackgroundColor({ color: '#28a745' });
            } else if (score > 0.5) {
                chrome.action.setBadgeBackgroundColor({ color: '#ffc107' });
            } else {
                chrome.action.setBadgeBackgroundColor({ color: '#dc3545' });
            }
        } else {
            chrome.action.setBadgeText({ text: '' });
        }
    } else if (message.type === 'GET_STATUS') {
        sendResponse(lastStatus);
    }
    return true;
});

chrome.tabs.onActivated.addListener(() => {
    lastStatus = { type: 'IDLE' };
    chrome.action.setBadgeText({ text: '' });
});

