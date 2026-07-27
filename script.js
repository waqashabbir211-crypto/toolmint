(function() {'use strict';

const state = {characterLimit: 5000,readingSpeed: 200,shortcuts: {'Ctrl+K': 'focusTextarea','Ctrl+Enter': 'copyStats','Ctrl+L': 'clearText'}};

const DOM = {textarea: null,charCount: null,charLimit: null,limitProgress: null,statWords: null,statCharacters: null,statSpaces: null,statSentences: null,statParagraphs: null,statReadtime: null,btnClear: null,btnCopy: null,btnDownload: null,btnSettings: null,btnHelp: null,modal: null,modalOverlay: null,modalClose: null,modalSave: null,modalCancel: null,settingLimit: null,settingReadSpeed: null,toastContainer: null,dragDropArea: null,dragDropOverlay: null,screenReaderAnnouncements: null,limitBar: null,helpModal: null,helpModalOverlay: null,helpModalClose: null};

function cacheDOM() {DOM.textarea = document.getElementById('tm-textarea');DOM.charCount = document.getElementById('tm-char-count');DOM.charLimit = document.getElementById('tm-char-limit');DOM.limitProgress = document.getElementById('tm-limit-progress');DOM.statWords = document.getElementById('tm-stat-words');DOM.statCharacters = document.getElementById('tm-stat-characters');DOM.statSpaces = document.getElementById('tm-stat-spaces');DOM.statSentences = document.getElementById('tm-stat-sentences');DOM.statParagraphs = document.getElementById('tm-stat-paragraphs');DOM.statReadtime = document.getElementById('tm-stat-readtime');DOM.btnClear = document.getElementById('tm-btn-clear');DOM.btnCopy = document.getElementById('tm-btn-copy');DOM.btnDownload = document.getElementById('tm-btn-download');DOM.btnSettings = document.getElementById('tm-btn-settings');DOM.btnHelp = document.getElementById('tm-btn-help');DOM.modal = document.getElementById('tm-modal');DOM.modalOverlay = document.getElementById('tm-modal-overlay');DOM.modalClose = document.getElementById('tm-modal-close');DOM.modalSave = document.getElementById('tm-modal-save');DOM.modalCancel = document.getElementById('tm-modal-cancel');DOM.settingLimit = document.getElementById('tm-setting-limit');DOM.settingReadSpeed = document.getElementById('tm-setting-readspeed');DOM.toastContainer = document.getElementById('tm-toast-container');DOM.dragDropArea = document.getElementById('tm-drag-drop-area');DOM.dragDropOverlay = document.querySelector('.tm-drag-drop-overlay');DOM.screenReaderAnnouncements = document.getElementById('tm-screen-reader-announcements');DOM.limitBar = document.querySelector('.tm-character-limit');DOM.helpModal = document.getElementById('tm-help-modal');DOM.helpModalOverlay = document.getElementById('tm-help-modal-overlay');DOM.helpModalClose = document.getElementById('tm-help-modal-close');}

function loadSettings() {const saved = localStorage.getItem('tm-settings');if (saved) {try {const settings = JSON.parse(saved);state.characterLimit = settings.characterLimit || 5000;state.readingSpeed = settings.readingSpeed || 200;updateSettingsUI();} catch (e) {// Silent error handling}}}

function updateSettingsUI() {if (DOM.settingLimit) DOM.settingLimit.value = state.characterLimit;if (DOM.settingReadSpeed) DOM.settingReadSpeed.value = state.readingSpeed;if (DOM.charLimit) DOM.charLimit.textContent = state.characterLimit;if (DOM.limitProgress) DOM.limitProgress.setAttribute('aria-valuemax', state.characterLimit);}

function countWords(text) {const trimmed = text.trim();if (!trimmed) return 0;return trimmed.split(/\s+/).length;}

function countCharacters(text) {return text.length;}

function countSpaces(text) {return (text.match(/\s/g) || []).length;}

function countSentences(text) {const sentences = text.match(/[.!?]+/g) || [];return sentences.length;}

function countParagraphs(text) {const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);return Math.max(paragraphs.length, text.trim().length > 0 ? 1 : 0);}

function calculateReadTime(wordCount) {const minutes = Math.ceil(wordCount / state.readingSpeed);return minutes;}

function updateStats() {if (!DOM.textarea) return;

const text = DOM.textarea.value;
const wordCount = countWords(text);
const charCount = countCharacters(text);
const spaceCount = countSpaces(text);
const sentenceCount = countSentences(text);
const paragraphCount = countParagraphs(text);
const readTime = calculateReadTime(wordCount);

if (DOM.statWords) DOM.statWords.textContent = wordCount;
if (DOM.statCharacters) DOM.statCharacters.textContent = charCount;
if (DOM.statSpaces) DOM.statSpaces.textContent = spaceCount;
if (DOM.statSentences) DOM.statSentences.textContent = sentenceCount;
if (DOM.statParagraphs) DOM.statParagraphs.textContent = paragraphCount;
if (DOM.statReadtime) DOM.statReadtime.textContent = readTime + ' min';

updateCharacterLimit(charCount);
announceToScreenReader(`Updated: ${wordCount} words, ${charCount} characters`);

}

function updateCharacterLimit(charCount) {if (DOM.charCount) DOM.charCount.textContent = charCount;

const percentage = (charCount / state.characterLimit) * 100;
if (DOM.limitProgress) DOM.limitProgress.style.width = Math.min(percentage, 100) + '%';
if (DOM.limitProgress) DOM.limitProgress.setAttribute('aria-valuenow', charCount);

if (DOM.limitBar) {
  DOM.limitBar.classList.remove('tm-warning', 'tm-danger');
  if (charCount > state.characterLimit) {
    DOM.limitBar.classList.add('tm-danger');
  } else if (charCount > state.characterLimit * 0.9) {
    DOM.limitBar.classList.add('tm-warning');
  }
}

}

function autoResizeTextarea() {if (!DOM.textarea) return;DOM.textarea.style.height = 'auto';DOM.textarea.style.height = Math.max(DOM.textarea.scrollHeight, 300) + 'px';}

function openModal() {if (DOM.modal) {DOM.modal.setAttribute('aria-hidden', 'false');if (DOM.settingLimit) DOM.settingLimit.focus();}}

function closeModal() {if (DOM.modal) DOM.modal.setAttribute('aria-hidden', 'true');if (DOM.btnSettings) DOM.btnSettings.focus();}

function openHelpModal() {if (DOM.helpModal) {DOM.helpModal.setAttribute('aria-hidden', 'false');}}

function closeHelpModal() {if (DOM.helpModal) {DOM.helpModal.setAttribute('aria-hidden', 'true');if (DOM.btnHelp) DOM.btnHelp.focus();}}

function saveSettings() {state.characterLimit = (DOM.settingLimit ? parseInt(DOM.settingLimit.value, 10) : 5000) || 5000;state.readingSpeed = (DOM.settingReadSpeed ? parseInt(DOM.settingReadSpeed.value, 10) : 200) || 200;

try {
  localStorage.setItem('tm-settings', JSON.stringify({
    characterLimit: state.characterLimit,
    readingSpeed: state.readingSpeed
  }));
} catch (e) {
  // Silent error handling
}

updateStats();
closeModal();
showToast('Settings saved successfully', 'success');

}

function clearText() {if (!DOM.textarea) return;if (DOM.textarea.value.length > 0) {DOM.textarea.value = '';updateStats();DOM.textarea.focus();showToast('Text cleared', 'success');announceToScreenReader('Text has been cleared');}}

function fallbackCopy(text) {const textArea = document.createElement('textarea');textArea.value = text;textArea.style.position = 'fixed';textArea.style.left = '-9999px';document.body.appendChild(textArea);textArea.select();try {document.execCommand('copy');showToast('Statistics copied to clipboard', 'success');announceToScreenReader('Statistics copied to clipboard');} catch (e) {showToast('Failed to copy statistics', 'error');announceToScreenReader('Failed to copy statistics');}document.body.removeChild(textArea);}

function copyStats() {if (!DOM.statWords || !DOM.statCharacters || !DOM.statSpaces || !DOM.statSentences || !DOM.statParagraphs || !DOM.statReadtime) {return;}

const stats = `Word Counter Statistics

Words: ${DOM.statWords.textContent}Characters: ${DOM.statCharacters.textContent}Spaces: ${DOM.statSpaces.textContent}Sentences: ${DOM.statSentences.textContent}Paragraphs: ${DOM.statParagraphs.textContent}Read Time: ${DOM.statReadtime.textContent}`;

if (navigator.clipboard && navigator.clipboard.writeText) {
  navigator.clipboard.writeText(stats).then(() => {
    showToast('Statistics copied to clipboard', 'success');
    announceToScreenReader('Statistics copied to clipboard');
  }).catch(() => {
    fallbackCopy(stats);
  });
} else {
  fallbackCopy(stats);
}

}

function downloadTxt() {if (!DOM.textarea) return;

const text = DOM.textarea.value;
if (!text) {
  showToast('Nothing to download', 'warning');
  return;
}

const element = document.createElement('a');
element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
element.setAttribute('download', 'toolmint-word-counter.txt');
element.style.display = 'none';
document.body.appendChild(element);
element.click();
document.body.removeChild(element);
showToast('File downloaded successfully', 'success');
announceToScreenReader('File downloaded successfully');

}

function showToast(message, type = 'info') {if (!DOM.toastContainer) return;

const toast = document.createElement('div');
toast.className = 'tm-toast tm-toast-' + type;

const iconMap = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
};

toast.innerHTML = `<span class="tm-toast-icon">${iconMap[type]}</span><span>${message}</span>`;
DOM.toastContainer.appendChild(toast);

setTimeout(() => {
  toast.classList.add('tm-toast-exit');
  setTimeout(() => {
    if (DOM.toastContainer && toast.parentNode === DOM.toastContainer) {
      DOM.toastContainer.removeChild(toast);
    }
  }, 300);
}, 3000);

}

function announceToScreenReader(message) {if (DOM.screenReaderAnnouncements) {DOM.screenReaderAnnouncements.textContent = message;setTimeout(() => {DOM.screenReaderAnnouncements.textContent = '';}, 1000);}}

function setupDragDrop() {const dragDropArea = DOM.dragDropArea;const dragDropOverlay = DOM.dragDropOverlay;

if (!dragDropArea) return;

dragDropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (dragDropOverlay) dragDropOverlay.classList.add('tm-active');
});

dragDropArea.addEventListener('dragleave', (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (dragDropOverlay) dragDropOverlay.classList.remove('tm-active');
});

dragDropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (dragDropOverlay) dragDropOverlay.classList.remove('tm-active');

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (DOM.textarea) {
          DOM.textarea.value = event.target.result;
          updateStats();
          autoResizeTextarea();
          showToast('File loaded successfully', 'success');
          announceToScreenReader('File loaded successfully');
        }
      };
      reader.onerror = () => {
        showToast('Failed to read file', 'error');
        announceToScreenReader('Failed to read file');
      };
      reader.readAsText(file);
    } else {
      showToast('Please drop a text file', 'warning');
      announceToScreenReader('Please drop a text file');
    }
  }
});

}

function setupKeyboardShortcuts() {document.addEventListener('keydown', (e) => {const isCtrl = e.ctrlKey || e.metaKey;

  if (isCtrl && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (DOM.textarea) DOM.textarea.focus();
  } else if (isCtrl && e.key === 'Enter') {
    e.preventDefault();
    copyStats();
  } else if (isCtrl && e.key.toLowerCase() === 'l') {
    e.preventDefault();
    clearText();
  }
});

}

function enforceCharacterLimit() {if (!DOM.textarea) return;if (DOM.textarea.value.length > state.characterLimit) {DOM.textarea.value = DOM.textarea.value.substring(0, state.characterLimit);updateStats();}}

function setupEventListeners() {if (DOM.textarea) {DOM.textarea.addEventListener('input', updateStats);DOM.textarea.addEventListener('input', autoResizeTextarea);DOM.textarea.addEventListener('input', enforceCharacterLimit);DOM.textarea.addEventListener('paste', (e) => {setTimeout(() => {enforceCharacterLimit();}, 0);});}

if (DOM.btnClear) DOM.btnClear.addEventListener('click', clearText);
if (DOM.btnCopy) DOM.btnCopy.addEventListener('click', copyStats);
if (DOM.btnDownload) DOM.btnDownload.addEventListener('click', downloadTxt);
if (DOM.btnSettings) DOM.btnSettings.addEventListener('click', openModal);
if (DOM.btnHelp) DOM.btnHelp.addEventListener('click', showHelpModal);

if (DOM.modalClose) DOM.modalClose.addEventListener('click', closeModal);
if (DOM.modalCancel) DOM.modalCancel.addEventListener('click', closeModal);
if (DOM.modalSave) DOM.modalSave.addEventListener('click', saveSettings);

if (DOM.modalOverlay) {
  DOM.modalOverlay.addEventListener('click', (e) => {
    if (e.target === DOM.modalOverlay) {
      closeModal();
    }
  });
}

if (DOM.modal) {
  DOM.modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    }

    if (e.key === 'Tab') {
      const focusableElements = DOM.modal.querySelectorAll('button, input, [tabindex]');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  });
}

if (DOM.helpModal) {
  if (DOM.helpModalClose) {
    DOM.helpModalClose.addEventListener('click', closeHelpModal);
  }
  if (DOM.helpModalOverlay) {
    DOM.helpModalOverlay.addEventListener('click', (e) => {
      if (e.target === DOM.helpModalOverlay) {
        closeHelpModal();
      }
    });
  }
  DOM.helpModal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeHelpModal();
    }
  });
}

if (DOM.settingLimit) {
  DOM.settingLimit.addEventListener('change', (e) => {
    const value = parseInt(e.target.value, 10);
    if (value < 100) DOM.settingLimit.value = 100;
    if (value > 50000) DOM.settingLimit.value = 50000;
  });
}

if (DOM.settingReadSpeed) {
  DOM.settingReadSpeed.addEventListener('change', (e) => {
    const value = parseInt(e.target.value, 10);
    if (value < 100) DOM.settingReadSpeed.value = 100;
    if (value > 500) DOM.settingReadSpeed.value = 500;
  });
}

}

function showHelpModal() {const helpContent = `Keyboard Shortcuts:Ctrl+K - Focus text areaCtrl+Enter - Copy statisticsCtrl+L - Clear text

Tips:

Drag and drop text files to load content

Use Settings to customize character limit and reading speed

Statistics update in real-time as you type`;

if (DOM.helpModal) {openHelpModal();} else {showToast('Help: ' + helpContent.split('\n')[0], 'info');announceToScreenReader(helpContent);}}

function init() {cacheDOM();loadSettings();updateStats();setupEventListeners();setupKeyboardShortcuts();setupDragDrop();}

if (document.readyState === 'loading') {document.addEventListener('DOMContentLoaded', init);} else {init();}})();
