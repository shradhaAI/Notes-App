document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const notesGrid = document.getElementById('notes-grid');
    const addNoteBtn = document.getElementById('add-note-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelNoteBtn = document.getElementById('cancel-note-btn');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const noteTitleInput = document.getElementById('note-title-input');
    const noteContentInput = document.getElementById('note-content-input');

    // State
    let notes = [];

    // Load notes from local storage
    loadNotes();

    // Event Listeners
    addNoteBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelNoteBtn.addEventListener('click', closeModal);
    saveNoteBtn.addEventListener('click', saveNote);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Functions

    function loadNotes() {
        const storedNotes = localStorage.getItem('glass-notes-app-data');
        if (storedNotes) {
            notes = JSON.parse(storedNotes);
        }
        renderNotes();
    }

    function saveToStorage() {
        localStorage.setItem('glass-notes-app-data', JSON.stringify(notes));
    }

    function renderNotes() {
        notesGrid.innerHTML = '';
        
        if (notes.length === 0) {
            notesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); margin-top: 3rem;">
                    <p>No notes yet. Click the + button to add one!</p>
                </div>
            `;
            return;
        }

        // Sort by date (newest first)
        const sortedNotes = [...notes].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedNotes.forEach(note => {
            const noteCard = createNoteElement(note);
            notesGrid.appendChild(noteCard);
        });
    }

    function createNoteElement(note) {
        const div = document.createElement('div');
        div.className = 'note-card';
        div.innerHTML = `
            <h3 class="note-title">${escapeHtml(note.title)}</h3>
            <div class="note-content">${escapeHtml(note.content).replace(/\n/g, '<br>')}</div>
            <div class="note-footer">
                <span class="note-date">${formatDate(note.date)}</span>
                <button class="delete-btn" data-id="${note.id}" aria-label="Delete note">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;

        // Add delete event listener
        const deleteBtn = div.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent potentially triggering other card clicks if we add them later
            deleteNote(note.id);
        });

        return div;
    }

    function saveNote() {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();

        if (!title && !content) {
            alert('Please enter a title or some content.');
            return;
        }

        const newNote = {
            id: Date.now().toString(),
            title: title || 'Untitled Note',
            content: content,
            date: new Date().toISOString()
        };

        notes.push(newNote);
        saveToStorage();
        renderNotes();
        closeModal();
    }

    function deleteNote(id) {
        if (confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(note => note.id !== id);
            saveToStorage();
            renderNotes();
        }
    }

    function openModal() {
        modalOverlay.classList.add('active');
        noteTitleInput.focus();
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        // Clear inputs after animation
        setTimeout(() => {
            noteTitleInput.value = '';
            noteContentInput.value = '';
        }, 300);
    }

    // Helper: Escape HTML to prevent XSS
    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // Helper: Format Date
    function formatDate(isoString) {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-US', { 
            month: 'short', 
            day: 'numeric' 
        }).format(date);
    }
});
