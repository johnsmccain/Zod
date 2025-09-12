// Content script for GuildWallet Chrome Extension

// Inject the provider into the page
const script = document.createElement('script')
script.src = chrome.runtime.getURL('inpage.js')
script.onload = function() {
  this.remove()
}
;(document.head || document.documentElement).appendChild(script)

// Listen for messages from the injected script
window.addEventListener('GUILDWALLET_MESSAGE', (event) => {
  // Forward messages to the background script
  chrome.runtime.sendMessage({
    type: 'GUILDWALLET_REQUEST',
    data: event.detail
  })
})

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GUILDWALLET_RESPONSE') {
    // Forward responses to the injected script
    window.dispatchEvent(new CustomEvent('GUILDWALLET_RESPONSE', {
      detail: request.data
    }))
  }
})
