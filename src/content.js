// chrome.runtime.sendMessage({ action: 'classifyImage', imageUrl: document.URL }, function(predictions) {
//   // Display the predictions on the current page
//   // Example: Replace the page content with the predictions
//   document.body.innerHTML = `<h1>Predictions:</h1><ul>${predictions.map(pred => `<li>${pred}</li>`).join('')}</ul>`;
// });

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('classifyBtn').addEventListener('click', function() {
      // Get the current tab URL and send it to background.js for classification
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const tab = tabs[0];
        // chrome.tabs.sendMessage(tab.id, { action: 'classifyImage', imageUrl: tab.url }, function(predictions) {
        //   // Handle the predictions if needed
        //   document.body.innerHTML = `<h1>Predictions:</h1><ul>${predictions.map(pred => `<li>${pred}</li>`).join('')}</ul>`;
        //   console.log(predictions);
        // });
        chrome.runtime.sendMessage({ action: 'classifyImage', imageUrl: tab.url }, function(predictions) {
          // Display the predictions on the current page
          // Example: Replace the page content with the predictions
          console.log(predictions);
          document.body.innerHTML = `<h1>Predictions:</h1><ul>${predictions.map(pred => `<li>${pred.className}</li>`).join('')}</ul>`;
        });
      });
    });
  })