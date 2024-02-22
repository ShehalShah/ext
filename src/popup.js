document.getElementById('classifyBtn').addEventListener('click', function() {
    // Get the current tab URL and send it to background.js for classification
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const tab = tabs[0];
      chrome.tabs.sendMessage(tab.id, { action: 'classifyImage', imageUrl: tab.url }, function(predictions) {
        // Handle the predictions if needed
        console.log(predictions);
      });
    });
  });
  