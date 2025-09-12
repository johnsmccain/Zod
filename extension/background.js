// Background script for GuildWallet Chrome Extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('GuildWallet extension installed')
})

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GUILDWALLET_REQUEST') {
    // Forward requests to the popup or handle them here
    console.log('Received request:', request)
    
    // For now, just acknowledge the request
    sendResponse({ success: true })
  }
})

// Handle tab updates to inject provider
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Inject the provider into the page
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['inpage.js']
    }).catch(error => {
      console.log('Could not inject script:', error)
    })
  }
})
