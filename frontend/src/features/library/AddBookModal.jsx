import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../../components/Modal.jsx';
import { createBookSchema, updateBookSchema } from './librarySchemas.js';
import { createBook, updateBook, clearLibraryError } from './librarySlice.js';
import './AddBookModal.css';

const AddBookModal = ({ isOpen, onClose, editingBook }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.library);

  const isEditMode = Boolean(editingBook);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEditMode ? updateBookSchema : createBookSchema),
    defaultValues: {
      title: '',
      author: '',
      isbn: '',
      category: '',
      totalCopies: 1,
    },
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(clearLibraryError());
      if (editingBook) {
        reset({
          title: editingBook.title || '',
          author: editingBook.author || '',
          isbn: editingBook.isbn || '',
          category: editingBook.category || '',
          totalCopies: editingBook.totalCopies || 1,
        });
      } else {
        reset({
          title: '',
          author: '',
          isbn: '',
          category: '',
          totalCopies: 1,
        });
      }
    }
  }, [isOpen, editingBook, reset, dispatch]);

  const onSubmit = async (data) => {
    // Clean up empty optional fields
    const payload = { ...data };
    if (!payload.isbn) delete payload.isbn;
    if (!payload.category) delete payload.category;

    let resultAction;
    if (isEditMode) {
      resultAction = await dispatch(updateBook({ bookId: editingBook._id, payload }));
      if (updateBook.fulfilled.match(resultAction)) {
        onClose();
      }
    } else {
      resultAction = await dispatch(createBook(payload));
      if (createBook.fulfilled.match(resultAction)) {
        onClose();
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Book' : 'Add Book'}
      maxWidth="500px"
    >
      <form className="add-book-form" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="add-book-form__error">
            {typeof error === 'string' ? error : 'An error occurred'}
          </div>
        )}

        <div className="add-book-form__group">
          <label className="add-book-form__label">Title *</label>
          <input
            type="text"
            className="add-book-form__input"
            disabled={loading}
            {...register('title')}
          />
          {errors.title && (
            <span className="add-book-form__field-error">{errors.title.message}</span>
          )}
        </div>

        <div className="add-book-form__group">
          <label className="add-book-form__label">Author *</label>
          <input
            type="text"
            className="add-book-form__input"
            disabled={loading}
            {...register('author')}
          />
          {errors.author && (
            <span className="add-book-form__field-error">{errors.author.message}</span>
          )}
        </div>

        <div className="add-book-form__group">
          <label className="add-book-form__label">ISBN</label>
          <input
            type="text"
            className="add-book-form__input"
            disabled={loading}
            placeholder="Optional"
            {...register('isbn')}
          />
          {errors.isbn && (
            <span className="add-book-form__field-error">{errors.isbn.message}</span>
          )}
        </div>

        <div className="add-book-form__group">
          <label className="add-book-form__label">Category</label>
          <input
            type="text"
            className="add-book-form__input"
            disabled={loading}
            placeholder="Optional (e.g., Science, Fiction)"
            {...register('category')}
          />
          {errors.category && (
            <span className="add-book-form__field-error">{errors.category.message}</span>
          )}
        </div>

        <div className="add-book-form__group">
          <label className="add-book-form__label">Total Copies *</label>
          <input
            type="number"
            className="add-book-form__input"
            disabled={loading}
            min="1"
            {...register('totalCopies')}
          />
          {errors.totalCopies && (
            <span className="add-book-form__field-error">{errors.totalCopies.message}</span>
          )}
        </div>

        <div className="add-book-form__actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Book' : 'Add Book'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddBookModal;
