import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useDebounce from '../../hooks/useDebounce.js';
import DataTable from '../../components/DataTable.jsx';
import Pagination from '../../components/Pagination.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import IssueBookModal from './IssueBookModal.jsx';
import { fetchBooks, deleteBook, returnBook, fetchBook } from './librarySlice.js';
import './BookCatalog.css';

const BookCatalog = ({ onEditBook }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, loading, pagination } = useSelector((state) => state.library);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedBookForIssue, setSelectedBookForIssue] = useState(null);

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedBookForReturn, setSelectedBookForReturn] = useState(null);
  const [selectedIssueForReturn, setSelectedIssueForReturn] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBookForDelete, setSelectedBookForDelete] = useState(null);

  const debouncedSearch = useDebounce(searchTerm, 400);

  const canManageBooks = useMemo(
    () => ['principal', 'academicManager', 'adminManager'].includes(user?.role),
    [user?.role]
  );

  const canIssueReturn = useMemo(
    () => ['principal', 'academicManager', 'adminManager', 'teacher'].includes(user?.role),
    [user?.role]
  );

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 20,
    };
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    if (categoryFilter) {
      params.category = categoryFilter;
    }
    dispatch(fetchBooks(params));
  }, [dispatch, currentPage, debouncedSearch, categoryFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  // Issue book
  const handleIssueClick = (book) => {
    setSelectedBookForIssue(book);
    setIssueModalOpen(true);
  };

  const handleCloseIssueModal = () => {
    setIssueModalOpen(false);
    setSelectedBookForIssue(null);
  };

  // Return book - need to fetch full book details to see issues
  const handleReturnClick = async (book) => {
    // Fetch full book with issues populated
    const resultAction = await dispatch(fetchBook(book._id));
    if (fetchBook.fulfilled.match(resultAction)) {
      const fullBook = resultAction.payload.book;
      const activeIssues = fullBook?.issues?.filter((issue) => issue.status === 'issued') || [];
      if (activeIssues.length === 0) {
        return;
      }
      // For simplicity, if only one active issue, auto-select it
      // Otherwise, we could show a selection modal
      if (activeIssues.length === 1) {
        setSelectedBookForReturn(fullBook);
        setSelectedIssueForReturn(activeIssues[0]);
        setReturnModalOpen(true);
      } else {
        // Multiple active issues - show selection
        setSelectedBookForReturn(fullBook);
        setSelectedIssueForReturn(null);
        setReturnModalOpen(true);
      }
    }
  };

  const handleConfirmReturn = async () => {
    if (!selectedBookForReturn || !selectedIssueForReturn) return;
    await dispatch(returnBook({
      bookId: selectedBookForReturn._id,
      userId: selectedIssueForReturn.userId._id || selectedIssueForReturn.userId,
    }));
    setReturnModalOpen(false);
    setSelectedBookForReturn(null);
    setSelectedIssueForReturn(null);
    // Refresh the list
    dispatch(fetchBooks({ page: currentPage, limit: 20, search: debouncedSearch, category: categoryFilter }));
  };

  const handleCancelReturn = () => {
    setReturnModalOpen(false);
    setSelectedBookForReturn(null);
    setSelectedIssueForReturn(null);
  };

  // Delete book
  const handleDeleteClick = (book) => {
    setSelectedBookForDelete(book);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBookForDelete) return;
    await dispatch(deleteBook(selectedBookForDelete._id));
    setDeleteModalOpen(false);
    setSelectedBookForDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setSelectedBookForDelete(null);
  };

  // Calculate issued count (totalCopies - availableCopies)
  const getIssuedCount = (book) => {
    return (book.totalCopies || 0) - (book.availableCopies || 0);
  };

  const columns = [
    { key: 'title', label: 'Title', width: '25%' },
    { key: 'author', label: 'Author', width: '18%' },
    { key: 'category', label: 'Category', width: '12%', render: (val) => val || '-' },
    { key: 'totalCopies', label: 'Total', width: '8%' },
    { key: 'availableCopies', label: 'Available', width: '8%' },
    {
      key: 'status',
      label: 'Status',
      width: '10%',
      render: (val) => (
        <StatusBadge
          status={val === 'available' ? 'active' : 'expired'}
          label={val === 'available' ? 'Available' : 'Out of Stock'}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '19%',
      render: (_, row) => (
        <div className="book-catalog__actions">
          {canIssueReturn && row.availableCopies > 0 && (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                handleIssueClick(row);
              }}
            >
              Issue
            </button>
          )}
          {canIssueReturn && getIssuedCount(row) > 0 && (
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleReturnClick(row);
              }}
            >
              Return
            </button>
          )}
          {canManageBooks && (
            <>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditBook(row);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(row);
                }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Get unique categories from items for filter dropdown
  const categories = useMemo(() => {
    const cats = new Set();
    items.forEach((book) => {
      if (book.category) {
        cats.add(book.category);
      }
    });
    return Array.from(cats).sort();
  }, [items]);

  return (
    <div className="book-catalog">
      <div className="book-catalog__filters">
        <input
          type="text"
          className="book-catalog__search"
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <select
          className="book-catalog__category-filter"
          value={categoryFilter}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        emptyText="No books found"
      />

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          perPage={pagination.limit}
          onPageChange={handlePageChange}
        />
      )}

      {/* Issue Book Modal */}
      <IssueBookModal
        isOpen={issueModalOpen}
        onClose={handleCloseIssueModal}
        book={selectedBookForIssue}
      />

      {/* Return Book Confirm Dialog */}
      <ConfirmDialog
        isOpen={returnModalOpen}
        title="Return Book"
        message={
          selectedBookForReturn && selectedIssueForReturn
            ? `Return "${selectedBookForReturn.title}" from ${selectedIssueForReturn.userId?.name || 'User'}?`
            : selectedBookForReturn
              ? 'Select the issue to return:'
              : ''
        }
        confirmLabel="Return"
        cancelLabel="Cancel"
        onConfirm={handleConfirmReturn}
        onCancel={handleCancelReturn}
      >
        {selectedBookForReturn && !selectedIssueForReturn && (
          <div className="book-catalog__return-select">
            <p>Select which issue to return:</p>
            <ul className="book-catalog__issue-list">
              {selectedBookForReturn.issues
                ?.filter((issue) => issue.status === 'issued')
                .map((issue) => (
                  <li key={issue._id} className="book-catalog__issue-item">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => setSelectedIssueForReturn(issue)}
                    >
                      {issue.userId?.name || 'Unknown User'} - Due: {new Date(issue.dueDate).toLocaleDateString()}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </ConfirmDialog>

      {/* Delete Book Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Book"
        message={`Are you sure you want to delete "${selectedBookForDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default BookCatalog;
