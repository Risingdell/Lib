import React from 'react';
import { useSnackbar } from '../Context/SnackbarContext';

const SnackbarDemo = () => {
  const { showSnackbar, showConfirmSnackbar } = useSnackbar();

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px' }}>Snackbar Demo</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Alert Snackbars (Auto-dismiss)</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => showSnackbar('success', '✓ Operation completed successfully!')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Show Success
          </button>

          <button
            onClick={() => showSnackbar('warning', '⚠ Please check your input fields')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Show Warning
          </button>

          <button
            onClick={() => showSnackbar('error', '✖ Failed to save changes')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Show Error
          </button>

          <button
            onClick={() => showSnackbar('success', 'This message will stay for 5 seconds', 5000)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            5 Second Alert
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Confirmation Snackbars (Manual dismiss)</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => showConfirmSnackbar(
              'Delete this item permanently?',
              () => {
                console.log('Delete confirmed!');
                showSnackbar('success', 'Item deleted successfully');
              },
              'error'
            )}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Delete Confirmation
          </button>

          <button
            onClick={() => showConfirmSnackbar(
              'Save changes to document?',
              () => {
                console.log('Save confirmed!');
                showSnackbar('success', 'Document saved');
              },
              'success'
            )}
            style={{
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Save Confirmation
          </button>

          <button
            onClick={() => showConfirmSnackbar(
              'Are you sure you want to proceed with this action?',
              () => {
                console.log('Action confirmed!');
                showSnackbar('success', 'Action completed');
              },
              'warning'
            )}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Warning Confirmation
          </button>
        </div>
      </div>

      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px'
      }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Animation Features:</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>✓ Smooth slide-up animation from bottom</li>
          <li>✓ Fade in/out overlay</li>
          <li>✓ Bounce effect on entry (cubic-bezier easing)</li>
          <li>✓ Smooth slide-down exit animation</li>
          <li>✓ Alert snackbars auto-dismiss after 3 seconds</li>
          <li>✓ Confirmation snackbars stay until action is taken</li>
        </ul>
      </div>
    </div>
  );
};

export default SnackbarDemo;
