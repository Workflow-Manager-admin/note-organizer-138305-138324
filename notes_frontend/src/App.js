import React, { useState, useRef } from 'react';
import './App.css';

// -- Styling helpers (use color constants from the work item) --
const COLOR_PRIMARY = '#2563eb';
const COLOR_ACCENT = '#10b981';
const COLOR_SECONDARY = '#fbbf24';

function getDefaultNotes() {
  return [
    {
      id: 1,
      title: 'Welcome to your Notes!',
      body: 'This is a note. Click "New Note" to create, or select any note to edit or delete.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
}

function sortNotesByUpdated(notes) {
  // newest updated first
  return [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

// PUBLIC_INTERFACE
function App() {
  const [notes, setNotes] = useState(getDefaultNotes());
  const [searchText, setSearchText] = useState('');
  const [selectedId, setSelectedId] = useState(notes[0].id);
  const [editing, setEditing] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createBody, setCreateBody] = useState('');
  const [theme] = useState('light'); // Only light theme per requirements

  const mainTitleRef = useRef(null);

  // Filtering
  const filteredNotes = sortNotesByUpdated(notes).filter(
    note =>
      note.title.toLowerCase().includes(searchText.toLowerCase()) ||
      note.body.toLowerCase().includes(searchText.toLowerCase())
  );

  // PUBLIC_INTERFACE
  function handleSelectNote(noteId) {
    setSelectedId(noteId);
    setEditing(false);
    setCreateTitle('');
    setCreateBody('');
  }

  // PUBLIC_INTERFACE
  function handleNewNote() {
    setEditing('new');
    setCreateTitle('');
    setCreateBody('');
    mainTitleRef.current && mainTitleRef.current.focus();
  }

  // PUBLIC_INTERFACE
  function handleEditNote() {
    setEditing('edit');
    const cur = notes.find(n => n.id === selectedId);
    setCreateTitle(cur ? cur.title : '');
    setCreateBody(cur ? cur.body : '');
    mainTitleRef.current && mainTitleRef.current.focus();
  }

  // PUBLIC_INTERFACE
  function handleSaveNote(e) {
    e && e.preventDefault();
    if ((editing === 'edit' || editing === true) && selectedId !== undefined) {
      if (!createTitle.trim()) return; // no empty titles
      setNotes(prev =>
        prev.map(n =>
          n.id === selectedId
            ? { ...n, title: createTitle, body: createBody, updatedAt: new Date().toISOString() }
            : n)
      );
      setEditing(false);
    } else if (editing === 'new') {
      if (!createTitle.trim()) return;
      const newNote = {
        id: Math.max(0, ...notes.map(n => n.id)) + 1,
        title: createTitle,
        body: createBody,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes(prev => [newNote, ...prev]);
      setSelectedId(newNote.id);
      setEditing(false);
    }
    setCreateTitle('');
    setCreateBody('');
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote() {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(prev => prev.filter(n => n.id !== selectedId));
      setSelectedId(prev => {
        const idx = notes.findIndex(n => n.id === prev);
        // Select previous note in list, fallback to first or none
        if (idx > 0) return notes[idx - 1].id;
        else if (notes.length > 1) return notes[1].id;
        else return undefined;
      });
    }
  }

  // PUBLIC_INTERFACE
  function handleCancelEdit() {
    setEditing(false);
    setCreateTitle('');
    setCreateBody('');
  }

  // UI Rendering
  function renderSidebar() {
    return (
      <aside className="notes-sidebar" style={{ borderRight: `1px solid var(--border-color)` }}>
        <div className="sidebar-header">
          <span className="logo-accent" style={{ color: COLOR_ACCENT, fontWeight: 900, fontSize: 24 }}>
            <svg style={{ verticalAlign: 'middle', marginRight: 8 }} width="32" height="32" fill={COLOR_ACCENT} viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="16" fill={COLOR_ACCENT}/>
              <text x="50%" y="55%" textAnchor="middle" fill="white" fontSize="14" dy=".3em" fontFamily="Arial">📝</text>
            </svg>
            Notes
          </span>
        </div>
        <div className="sidebar-controls">
          <button
            className="sidebar-btn"
            style={{ background: COLOR_PRIMARY, color: 'white', marginBottom: 10 }}
            onClick={handleNewNote}
          >+ New Note</button>
          <input
            className="sidebar-search"
            style={{ borderColor: COLOR_ACCENT }}
            placeholder="Search notes..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            aria-label="Search notes"
          />
        </div>
        <ul className="notes-list" role="listbox" aria-label="Notes">
          {filteredNotes.length === 0 ? (
            <li className="notes-list-empty" aria-disabled="true">No notes found.</li>
          ) : (
            filteredNotes.map(note => (
              <li
                key={note.id}
                className={"notes-list-item" + (note.id === selectedId ? " notes-list-item-selected" : "")}
                tabIndex={0}
                aria-selected={note.id === selectedId}
                onClick={() => handleSelectNote(note.id)}
                style={note.id === selectedId
                  ? { background: COLOR_ACCENT + '22', borderLeft: `4px solid ${COLOR_ACCENT}` }
                  : undefined
                }
              >
                <strong>{note.title || <em>Untitled</em>}</strong>
                <br />
                <span className="notes-list-preview">{(note.body || '').slice(0, 30)}{(note.body || '').length > 30 ? '...' : ''}</span>
              </li>
            ))
          )}
        </ul>
      </aside>
    );
  }

  function renderMainView() {
    const selected = notes.find(n => n.id === selectedId);

    // Editing (new note or edit note)
    if (editing) {
      return (
        <main className="notes-main">
          <form className="note-form" onSubmit={handleSaveNote}>
            <h2 style={{ color: COLOR_ACCENT }}>{editing === 'new' ? 'New Note' : 'Edit Note'}</h2>
            <input
              ref={mainTitleRef}
              type="text"
              className="note-title-input"
              placeholder="Note title"
              value={createTitle}
              onChange={e => setCreateTitle(e.target.value)}
              minLength={1}
              style={{ borderColor: COLOR_ACCENT }}
              required
              aria-label="Note title"
              autoFocus
            />
            <textarea
              className="note-body-input"
              placeholder="Write your note here..."
              value={createBody}
              onChange={e => setCreateBody(e.target.value)}
              style={{ borderColor: COLOR_ACCENT, minHeight: '8em' }}
              aria-label="Note body"
            />
            <div className="note-form-actions">
              <button
                className="note-btn"
                style={{ background: COLOR_PRIMARY, color: 'white' }}
                type="submit"
              >Save</button>
              <button
                className="note-btn note-btn-secondary"
                style={{ background: '#e5e7eb', color: COLOR_PRIMARY, border: `1px solid ${COLOR_PRIMARY}`, marginLeft: 10 }}
                type="button"
                onClick={handleCancelEdit}
              >Cancel</button>
            </div>
          </form>
        </main>
      );
    }

    // Viewing/reading a note
    if (selected) {
      return (
        <main className="notes-main">
          <header className="note-header" style={{ borderBottom: `1px solid var(--border-color)` }}>
            <h2 className="note-title" style={{ color: COLOR_ACCENT }}>{selected.title || <em>Untitled note</em>}</h2>
            <div className="note-actions">
              <button
                className="note-btn"
                style={{ background: COLOR_ACCENT, color: 'white' }}
                onClick={handleEditNote}
                aria-label="Edit this note"
              >Edit</button>
              <button
                className="note-btn note-btn-danger"
                style={{ background: COLOR_SECONDARY, color: '#fff', marginLeft: 10 }}
                onClick={handleDeleteNote}
                aria-label="Delete this note"
                disabled={notes.length === 1}
                title={notes.length === 1 ? "Can't delete last note." : ''}
              >Delete</button>
            </div>
          </header>
          <div className="note-view">
            <div className="note-body">{selected.body ? selected.body.split('\n').map((line, i) => <p key={i}>{line}</p>) : <em>No content</em>}</div>
            <div className="note-dates">
              <small>Last updated: {new Date(selected.updatedAt).toLocaleString()}</small>
            </div>
          </div>
        </main>
      );
    }

    // No note selected
    return (
      <main className="notes-main notes-main-empty">
        <span style={{ color: COLOR_PRIMARY }}>Select or create a note to get started!</span>
      </main>
    );
  }

  return (
    <div className="notes-app-container" data-theme={theme}>
      {renderSidebar()}
      {renderMainView()}
    </div>
  );
}

export default App;
