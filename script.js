"use strict";

document.addEventListener('DOMContentLoaded', function() {
    // ========================================
    // WORD COUNTER ELEMENTS
    // ========================================
    const textarea = document.getElementById('tm-textarea');
    const textareaWrapper = document.querySelector('.tm-textarea-wrapper');
    const charCountSpan = document.getElementById('tm-char-count');
    const charLimitSpan = document.getElementById('tm-char-limit');
    const limitProgress = document.getElementById('tm-limit-progress');
    const statWords = document.getElementById('tm-stat-words');
    const statCharacters = document.getElementById('tm-stat-characters');
    const statSpaces = document.getElementById('tm-stat-spaces');
    const statSentences = document.getElementById('tm-stat-sentences');
    const statParagraphs = document.getElementById('tm-stat-paragraphs');
    const statReadtime = document.getElementById('tm-stat-readtime');
    
    // ========================================
    // BUTTON ELEMENTS
    // ========================================
    const btnClear = document.getElementById('tm-btn-clear');
    const btnCopy = document.getElementById('tm-btn-copy');
    const btnDownload = document.getElementById('tm-btn-download');
    const btnSettings = document.getElementById('tm-btn-settings');
    const btnHelp = document.getElementById('tm-btn-help');
    
    // ========================================
    // MODAL ELEMENTS
    // ========================================
    const settingsModal = document.getElementById('tm-modal');
    const helpModal = document.getElementById('tm-help-modal');
    const modalOverlay = document.getElementById('tm-modal-overlay');
    const helpModalOverlay = document.getElementById('tm-help-modal-overlay');
    const modalClose = document.getElementById('tm-modal-close');
    const helpModalClose = document.getElementById('tm-help-modal-close');
    const modalSave = document.getElementById('tm-modal-save');
    const modalCancel = document.getElementById('tm-modal-cancel');
    const helpCloseBtn = document.getElementById('tm-help-close-btn');
    const settingLimit = document.getElementById('tm-setting-limit');
    const settingReadspeed = document.getElementById('tm-setting-readspeed');
    
    // ========================================
    // OTHER ELEMENTS
    // ========================================
    const dragDropArea = document.getElementById('tm-drag-drop-area');
    const toastContainer = document.getElementById('tm-toast-container');
    
    // ========================================
    // SETTINGS STATE
    // ========================================
    let characterLimit = 5000;
    let readingSpeed = 200;
    
    // Initialize character limit on textarea
    if (textarea) {
        textarea.maxLength = characterLimit;
    }
    
    // ========================================
    // WORD COUNTER FUNCTIONS
    // ========================================
    function updateStatistics() {
        const text = textarea.value;
        
        // Characters
        const charCount = text.length;
        statCharacters.textContent = charCount;
        charCountSpan.textContent = charCount;
        
        // Update character limit bar
        const progress = (charCount / characterLimit) * 100;
        limitProgress.style.width = progress + '%';
        limitProgress.setAttribute('aria-valuenow', charCount);
        limitProgress.setAttribute('aria-valuemax', characterLimit);
        charLimitSpan.textContent = characterLimit;
        
        // Spaces
        const spaceCount = (text.match(/ /g) || []).length;
        statSpaces.textContent = spaceCount;
        
        // Words
        const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        statWords.textContent = wordCount;
        
        // Sentences
        const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        statSentences.textContent = text.trim() === '' ? 0 : sentenceCount;
        
        // Paragraphs
        const paragraphCount = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
        statParagraphs.textContent = text.trim() === '' ? 0 : paragraphCount;
        
        // Read time
        const readTime = Math.ceil(wordCount / readingSpeed);
        statReadtime.textContent = readTime === 0 ? '0 min' : readTime + ' min';
    }
    
    // Real-time statistics update and character limit enforcement
    if (textarea) {
        textarea.addEventListener('input', function() {
            if (this.value.length > characterLimit) {
                this.value = this.value.substring(0, characterLimit);
            }
            updateStatistics();
        });
        textarea.addEventListener('change', updateStatistics);
    }
    
    // ========================================
    // CLEAR BUTTON
    // ========================================
    if (btnClear) {
        btnClear.addEventListener('click', function() {
            textarea.value = '';
            updateStatistics();
            textarea.focus();
            showToast('Text cleared');
        });
    }
    
    // ========================================
    // COPY STATS BUTTON
    // ========================================
    if (btnCopy) {
        btnCopy.addEventListener('click', function() {
            const stats = `Words: ${statWords.textContent}
Characters: ${statCharacters.textContent}
Spaces: ${statSpaces.textContent}
Sentences: ${statSentences.textContent}
Paragraphs: ${statParagraphs.textContent}
Read Time: ${statReadtime.textContent}`;
            
            navigator.clipboard.writeText(stats).then(() => {
                showToast('Statistics copied to clipboard');
            }).catch(() => {
                showToast('Failed to copy statistics');
            });
        });
    }
    
    // ========================================
    // DOWNLOAD BUTTON
    // ========================================
    if (btnDownload) {
        btnDownload.addEventListener('click', function() {
            const text = textarea.value;
            const stats = `=== WORD COUNTER REPORT ===
Generated: ${new Date().toLocaleString()}

STATISTICS:
Words: ${statWords.textContent}
Characters: ${statCharacters.textContent}
Spaces: ${statSpaces.textContent}
Sentences: ${statSentences.textContent}
Paragraphs: ${statParagraphs.textContent}
Read Time: ${statReadtime.textContent}

========================
TEXT CONTENT
========================

${text}`;
            
            const blob = new Blob([stats], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'word-count-report.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Report downloaded');
        });
    }
    
    // ========================================
    // MODAL MANAGEMENT
    // ========================================
    function openModal(modal) {
        if (modal) {
            modal.setAttribute('aria-hidden', 'false');
        }
    }
    
    function closeModal(modal) {
        if (modal) {
            modal.setAttribute('aria-hidden', 'true');
        }
    }
    
    // ========================================
    // SETTINGS MODAL
    // ========================================
    if (btnSettings) {
        btnSettings.addEventListener('click', function() {
            settingLimit.value = characterLimit;
            settingReadspeed.value = readingSpeed;
            openModal(settingsModal);
        });
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            closeModal(settingsModal);
        });
    }
    
    if (modalCancel) {
        modalCancel.addEventListener('click', function() {
            closeModal(settingsModal);
        });
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function() {
            closeModal(settingsModal);
        });
    }
    
    if (modalSave) {
        modalSave.addEventListener('click', function() {
            const newLimit = parseInt(settingLimit.value) || 5000;
            const newSpeed = parseInt(settingReadspeed.value) || 200;
            
            if (newLimit >= 100 && newLimit <= 50000) {
                characterLimit = newLimit;
                if (textarea) {
                    textarea.maxLength = newLimit;
                    if (textarea.value.length > newLimit) {
                        textarea.value = textarea.value.substring(0, newLimit);
                    }
                }
            }
            if (newSpeed >= 100 && newSpeed <= 500) {
                readingSpeed = newSpeed;
            }
            
            closeModal(settingsModal);
            updateStatistics();
            showToast('Settings saved');
        });
    }
    
    // ========================================
    // HELP MODAL
    // ========================================
    if (btnHelp) {
        btnHelp.addEventListener('click', function() {
            openModal(helpModal);
        });
    }
    
    if (helpModalClose) {
        helpModalClose.addEventListener('click', function() {
            closeModal(helpModal);
        });
    }
    
    if (helpCloseBtn) {
        helpCloseBtn.addEventListener('click', function() {
            closeModal(helpModal);
        });
    }
    
    if (helpModalOverlay) {
        helpModalOverlay.addEventListener('click', function() {
            closeModal(helpModal);
        });
    }
    
    // ========================================
    // ESCAPE KEY CLOSES MODALS
    // ========================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal(settingsModal);
            closeModal(helpModal);
        }
    });
    
    // ========================================
    // KEYBOARD SHORTCUTS
    // ========================================
    document.addEventListener('keydown', function(e) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? e.metaKey : e.ctrlKey;
        
        if (modifier && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (textarea) {
                textarea.focus();
            }
        }
        
        if (modifier && e.key === 'Enter') {
            e.preventDefault();
            if (btnCopy) {
                btnCopy.click();
            }
        }
        
        if (modifier && e.key.toLowerCase() === 'l') {
            e.preventDefault();
            if (btnClear) {
                btnClear.click();
            }
        }
    });
    
    // ========================================
    // DRAG AND DROP
    // ========================================
    function setupDragAndDrop() {
        if (!textareaWrapper || !textarea) return;
        
        textareaWrapper.addEventListener('dragenter', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (dragDropArea) {
                dragDropArea.classList.add('active');
            }
        });
        
        textareaWrapper.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (dragDropArea) {
                dragDropArea.classList.add('active');
            }
        });
        
        textareaWrapper.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (dragDropArea) {
                dragDropArea.classList.remove('active');
            }
        });
        
        textareaWrapper.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (dragDropArea) {
                dragDropArea.classList.remove('active');
            }
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                
                if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        let content = event.target.result;
                        if (content.length > characterLimit) {
                            content = content.substring(0, characterLimit);
                        }
                        textarea.value = content;
                        updateStatistics();
                        showToast('File loaded successfully');
                    };
                    reader.onerror = function() {
                        showToast('Failed to read file');
                    };
                    reader.readAsText(file);
                } else {
                    showToast('Please drop a .txt file');
                }
            }
        });
    }
    
    // ========================================
    // TOAST NOTIFICATIONS
    // ========================================
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'tm-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.textContent = message;
        
        if (toastContainer) {
            toastContainer.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.add('tm-toast-exit');
                setTimeout(() => {
                    if (toastContainer.contains(toast)) {
                        toastContainer.removeChild(toast);
                    }
                }, 300);
            }, 2000);
        }
    }
    
    // ========================================
    // HOMEPAGE TOOL SEARCH
    // ========================================
    const heroSearchInput = document.getElementById('tm-hero-search-input');
    const btnHeroSearch = document.getElementById('tm-btn-hero-search');
    const toolCards = document.querySelectorAll('.tm-tool-card');
    const toolsGrid = document.querySelector('.tm-tools-grid');
    
    function filterTools(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        let matchCount = 0;
        
        toolCards.forEach(card => {
            const name = card.querySelector('.tm-tool-name')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.tm-tool-description')?.textContent.toLowerCase() || '';
            const category = card.querySelector('.tm-tool-category')?.textContent.toLowerCase() || '';
            
            const matches = name.includes(term) || description.includes(term) || category.includes(term);
            
            if (matches) {
                card.style.display = '';
                matchCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        let noResultsMsg = document.getElementById('tm-no-results');
        
        if (matchCount === 0 && term !== '') {
            if (!noResultsMsg && toolsGrid) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.id = 'tm-no-results';
                noResultsMsg.className = 'tm-no-results';
                toolsGrid.appendChild(noResultsMsg);
            }
            if (noResultsMsg) {
                noResultsMsg.textContent = `No tools found matching "${searchTerm}". Try a different search.`;
            }
        } else if (noResultsMsg && noResultsMsg.parentNode) {
            noResultsMsg.parentNode.removeChild(noResultsMsg);
        }
    }
    
    if (heroSearchInput) {
        heroSearchInput.addEventListener('input', function() {
            filterTools(this.value);
        });
        
        heroSearchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                filterTools(this.value);
            }
        });
    }
    
    if (btnHeroSearch) {
        btnHeroSearch.addEventListener('click', function() {
            if (heroSearchInput) {
                filterTools(heroSearchInput.value);
            }
        });
    }
    
    // ========================================
    // MOBILE NAVIGATION
    // ========================================
    const mobileMenuBtn = document.getElementById('tm-mobile-menu-btn');
    const navMain = document.getElementById('tm-nav-main');
    const navLinks = document.querySelectorAll('.tm-nav-link');
    
    function closeMobileMenu() {
        if (mobileMenuBtn && navMain) {
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            navMain.style.display = '';
            navMain.style.position = '';
            navMain.style.top = '';
            navMain.style.left = '';
            navMain.style.right = '';
            navMain.style.backgroundColor = '';
            navMain.style.borderBottom = '';
            navMain.style.padding = '';
            navMain.style.zIndex = '';
        }
    }
    
    if (mobileMenuBtn && navMain) {
        mobileMenuBtn.addEventListener('click', function() {
            const isOpen = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            
            if (!isOpen) {
                mobileMenuBtn.setAttribute('aria-expanded', 'true');
                navMain.style.display = 'flex';
                navMain.style.flexDirection = 'column';
                navMain.style.position = 'absolute';
                navMain.style.top = '100%';
                navMain.style.left = '0';
                navMain.style.right = '0';
                navMain.style.backgroundColor = '#FFFFFF';
                navMain.style.borderBottom = '1px solid #E5E7EB';
                navMain.style.padding = '16px';
                navMain.style.zIndex = '99';
            } else {
                closeMobileMenu();
            }
        });
        
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeMobileMenu();
            });
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenuBtn.getAttribute('aria-expanded') === 'true') {
                closeMobileMenu();
            }
        });
    }
    
    // ========================================
    // FOOTER YEAR
    // ========================================
    const currentYearSpan = document.getElementById('tm-current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
    
    // ========================================
    // INITIALIZE
    // ========================================
    setupDragAndDrop();
    if (textarea) {
        updateStatistics();
    }
});
