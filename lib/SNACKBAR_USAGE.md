# Snackbar Component Usage Guide

A modern, reusable Snackbar component system with smooth animations and two variants: Alert and Confirmation.

## Features

- **Two Variants**: Alert (auto-dismiss) and Confirmation (with buttons)
- **Three Types**: Success, Warning, and Error with color-coded styling
- **Smooth Animations**: Slide-up entrance and slide-down exit
- **Auto-dismiss**: Alert snackbars disappear after 3 seconds (customizable)
- **Responsive**: Works great on mobile and desktop
- **Global State**: Uses Context API for easy access anywhere in your app

## Setup

### 1. Wrap Your App with SnackbarProvider

In your `main.jsx` or `App.jsx`, wrap your app with the `SnackbarProvider`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SnackbarProvider } from './Context/SnackbarContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  </React.StrictMode>
);
```

## Usage

### Import the Hook

```jsx
import { useSnackbar } from '../Context/SnackbarContext';
```

### In Your Component

```jsx
const MyComponent = () => {
  const { showSnackbar, showConfirmSnackbar } = useSnackbar();

  // Your component logic...
};
```

## Alert Snackbar

Shows a message with an icon and auto-dismisses after 3 seconds (customizable).

### Syntax

```javascript
showSnackbar(type, message, duration);
```

### Parameters

- `type` (string): `'success'`, `'warning'`, or `'error'`
- `message` (string): The message to display
- `duration` (number, optional): Duration in milliseconds (default: 3000)

### Examples

```jsx
// Success message
const handleSave = () => {
  // Save logic...
  showSnackbar('success', 'Book saved successfully!');
};

// Warning message
const handleWarning = () => {
  showSnackbar('warning', 'Please fill in all required fields');
};

// Error message
const handleError = () => {
  showSnackbar('error', 'Failed to load data. Please try again.');
};

// Custom duration (5 seconds)
const handleLongMessage = () => {
  showSnackbar('success', 'Operation completed!', 5000);
};
```

## Confirmation Snackbar

Shows a message with "Confirm" and "Cancel" buttons. Does not auto-dismiss.

### Syntax

```javascript
showConfirmSnackbar(message, onConfirm, type);
```

### Parameters

- `message` (string): The message to display
- `onConfirm` (function): Callback executed when user clicks "Confirm"
- `type` (string, optional): `'success'`, `'warning'`, or `'error'` (default: `'warning'`)

### Examples

```jsx
// Delete confirmation
const handleDelete = () => {
  showConfirmSnackbar(
    'Are you sure you want to delete this item?',
    () => {
      // Delete logic here
      console.log('Item deleted');
      // Optionally show success message
      showSnackbar('success', 'Item deleted successfully');
    },
    'error'
  );
};

// Save confirmation
const handleSaveConfirm = () => {
  showConfirmSnackbar(
    'Save changes to this document?',
    () => {
      // Save logic here
      console.log('Changes saved');
      showSnackbar('success', 'Changes saved');
    },
    'success'
  );
};

// Generic confirmation
const handleAction = () => {
  showConfirmSnackbar(
    'Proceed with this action?',
    () => {
      // Action logic
      console.log('Action confirmed');
    }
  );
};
```

## Complete Example Component

```jsx
import React, { useState } from 'react';
import { useSnackbar } from '../Context/SnackbarContext';

const BookManager = () => {
  const { showSnackbar, showConfirmSnackbar } = useSnackbar();
  const [books, setBooks] = useState([]);

  const handleAddBook = (bookData) => {
    try {
      // Add book logic
      setBooks([...books, bookData]);
      showSnackbar('success', 'Book added successfully!');
    } catch (error) {
      showSnackbar('error', 'Failed to add book. Please try again.');
    }
  };

  const handleDeleteBook = (bookId) => {
    showConfirmSnackbar(
      'Are you sure you want to delete this book?',
      () => {
        // Delete logic
        setBooks(books.filter(b => b.id !== bookId));
        showSnackbar('success', 'Book deleted');
      },
      'error'
    );
  };

  const handleBorrowBook = (bookId) => {
    const book = books.find(b => b.id === bookId);

    if (!book.available) {
      showSnackbar('warning', 'This book is currently unavailable');
      return;
    }

    showConfirmSnackbar(
      `Borrow "${book.title}"?`,
      () => {
        // Borrow logic
        console.log('Book borrowed');
        showSnackbar('success', 'Book borrowed successfully!');
      }
    );
  };

  return (
    <div>
      <button onClick={() => handleAddBook({ id: 1, title: 'New Book' })}>
        Add Book
      </button>
      <button onClick={() => handleDeleteBook(1)}>
        Delete Book
      </button>
      <button onClick={() => handleBorrowBook(1)}>
        Borrow Book
      </button>
    </div>
  );
};

export default BookManager;
```

## Styling Customization

The Snackbar uses CSS variables and can be customized in `Snackbar.css`:

- **Colors**: Modify the border-left-color and background gradients for each type
- **Dimensions**: Adjust min-width, max-width, padding
- **Animation**: Customize timing in @keyframes
- **Position**: Change bottom/left/right in .snackbar-overlay

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS animations and flexbox required
- Responsive design works on all screen sizes

## Tips

1. **Don't Stack**: The component shows one snackbar at a time. New calls will replace the current one.
2. **Keep Messages Short**: Best UX with concise messages (under 100 characters)
3. **Use Appropriate Types**:
   - Success: Completed actions
   - Warning: Cautions or missing info
   - Error: Failed operations
4. **Confirmation for Destructive Actions**: Always use confirmation snackbar for deletes or irreversible actions

## Troubleshooting

**Snackbar not showing:**
- Ensure `SnackbarProvider` wraps your component tree
- Check z-index conflicts with other elements

**Animation issues:**
- Verify CSS file is imported
- Check browser support for CSS animations

**Hook errors:**
- Make sure you're using `useSnackbar` inside a component wrapped by `SnackbarProvider`
