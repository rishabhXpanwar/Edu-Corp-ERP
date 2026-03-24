import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import PageHeader from '../../components/PageHeader.jsx';
import BookCatalog from './BookCatalog.jsx';
import AddBookModal from './AddBookModal.jsx';
import './LibraryPage.css';

const LibraryPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const canManageBooks = useMemo(
    () => ['principal', 'academicManager', 'adminManager'].includes(user?.role),
    [user?.role]
  );

  const handleAddBook = () => {
    setEditingBook(null);
    setIsAddModalOpen(true);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingBook(null);
  };

  return (
    <div className="library-page">
      <PageHeader
        title="Library Management"
        subtitle="Browse, issue, and manage library books"
        actions={
          canManageBooks && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddBook}
            >
              Add Book
            </button>
          )
        }
      />

      <section className="library-page__content">
        <BookCatalog onEditBook={handleEditBook} />
      </section>

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        editingBook={editingBook}
      />
    </div>
  );
};

export default LibraryPage;
