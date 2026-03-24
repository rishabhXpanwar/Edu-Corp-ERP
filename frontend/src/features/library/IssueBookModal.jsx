import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../../components/Modal.jsx';
import { issueBookSchema } from './librarySchemas.js';
import { issueBook, clearLibraryError, fetchBooks } from './librarySlice.js';
import { fetchStudents } from '../students/studentSlice.js';
import { fetchTeachers } from '../teachers/teacherSlice.js';
import './IssueBookModal.css';

const IssueBookModal = ({ isOpen, onClose, book }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.library);
  const { students = [], loading: studentsLoading } = useSelector((state) => state.students);
  const { teachers = [], loading: teachersLoading } = useSelector((state) => state.teachers);

  const [userType, setUserType] = useState('student');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(issueBookSchema),
    defaultValues: {
      userId: '',
      dueDate: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(clearLibraryError());
      reset({
        userId: '',
        dueDate: '',
      });
      setUserType('student');
      // Fetch students and teachers for selection
      dispatch(fetchStudents({ limit: 100 }));
      dispatch(fetchTeachers({ limit: 100 }));
    }
  }, [isOpen, reset, dispatch]);

  const onSubmit = async (data) => {
    if (!book) return;

    const resultAction = await dispatch(issueBook({
      bookId: book._id,
      payload: {
        userId: data.userId,
        dueDate: data.dueDate,
      },
    }));

    if (issueBook.fulfilled.match(resultAction)) {
      // Refresh the book list
      dispatch(fetchBooks({ page: 1, limit: 20 }));
      onClose();
    }
  };

  const userOptions = userType === 'student' ? students : teachers;
  const isLoadingUsers = userType === 'student' ? studentsLoading : teachersLoading;

  // Calculate min date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Issue Book: ${book?.title || ''}`}
      maxWidth="480px"
    >
      <form className="issue-book-form" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="issue-book-form__error">
            {typeof error === 'string' ? error : 'An error occurred'}
          </div>
        )}

        <div className="issue-book-form__info">
          <p><strong>Book:</strong> {book?.title}</p>
          <p><strong>Author:</strong> {book?.author}</p>
          <p><strong>Available Copies:</strong> {book?.availableCopies}</p>
        </div>

        <div className="issue-book-form__group">
          <label className="issue-book-form__label">User Type</label>
          <div className="issue-book-form__radio-group">
            <label className="issue-book-form__radio">
              <input
                type="radio"
                name="userType"
                value="student"
                checked={userType === 'student'}
                onChange={(e) => setUserType(e.target.value)}
              />
              Student
            </label>
            <label className="issue-book-form__radio">
              <input
                type="radio"
                name="userType"
                value="teacher"
                checked={userType === 'teacher'}
                onChange={(e) => setUserType(e.target.value)}
              />
              Teacher/Staff
            </label>
          </div>
        </div>

        <div className="issue-book-form__group">
          <label className="issue-book-form__label">Select User *</label>
          <select
            className="issue-book-form__select"
            disabled={loading || isLoadingUsers}
            {...register('userId')}
          >
            <option value="">
              {isLoadingUsers ? 'Loading...' : `Select a ${userType}`}
            </option>
            {userOptions.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} {user.email ? `(${user.email})` : ''}
              </option>
            ))}
          </select>
          {errors.userId && (
            <span className="issue-book-form__field-error">{errors.userId.message}</span>
          )}
        </div>

        <div className="issue-book-form__group">
          <label className="issue-book-form__label">Due Date *</label>
          <input
            type="date"
            className="issue-book-form__input"
            disabled={loading}
            min={minDate}
            {...register('dueDate')}
          />
          {errors.dueDate && (
            <span className="issue-book-form__field-error">{errors.dueDate.message}</span>
          )}
        </div>

        <div className="issue-book-form__actions">
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
            disabled={loading || isLoadingUsers}
          >
            {loading ? 'Issuing...' : 'Issue Book'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default IssueBookModal;
