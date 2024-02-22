chrome.runtime.sendMessage({ action: 'classifyImage', imageUrl: document.URL }, function(predictions) {
  // Display the predictions on the current page
  // Example: Replace the page content with the predictions
  document.body.innerHTML = `<h1>Predictions:</h1><ul>${predictions.map(pred => `<li>${pred}</li>`).join('')}</ul>`;
});
