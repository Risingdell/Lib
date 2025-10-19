# Enhanced Marketplace Request Queue System

## Overview

This implementation adds a comprehensive request queue system to the used books marketplace, allowing multiple buyers to request the same book with automatic queue management, transaction tracking, and completion workflow.

## Features Implemented

### 1. **Multiple Buyer Request Queue**
- Multiple users can request to buy the same book
- First-come-first-served priority system
- Real-time queue position tracking
- Visual queue display for sellers

### 2. **Automatic Queue Promotion**
- When the first buyer cancels, the next buyer automatically becomes active
- Seamless transition with database triggers and stored procedures
- No manual intervention required

### 3. **Enhanced Transaction Flow**
- **Request Phase**: Buyers join the queue
- **Sold Phase**: Seller marks book as sold to active buyer
- **Completed Phase**: Buyer confirms receipt, transaction completes
- **Auto-removal**: Completed books are removed from marketplace

### 4. **Seller View Enhancements**
- See all requesters with timestamps
- Visual indication of priority (active) buyer
- Request count badges
- One-click "Mark as Sold" button

### 5. **Buyer View Enhancements**
- "Requested Books" section in sidebar with badge count
- Queue position indicator
- Priority buyer notifications
- Confirm receipt button when seller marks as sold

## Database Changes

### New Table: `book_requests`
```sql
- id (Primary Key)
- marketplace_book_id (Foreign Key → used_books_marketplace)
- requester_id (Foreign Key → users)
- requested_at (DATETIME)
- status (ENUM: 'active', 'cancelled', 'completed')
- is_priority_buyer (BOOLEAN) - TRUE for first in queue
- cancelled_at (DATETIME, nullable)
- completed_at (DATETIME, nullable)
```

### Modified Table: `used_books_marketplace`
```sql
Added columns:
- status (enhanced ENUM: 'available', 'requested', 'sold', 'completed')
- active_requester_id (Foreign Key → users)
- sold_at (DATETIME, nullable)
- completed_at (DATETIME, nullable)
- total_requests (INT) - auto-maintained by triggers
```

### Database Objects Created
1. **Triggers**: Auto-update request counts
   - `update_request_count_insert`
   - `update_request_count_update`
   - `update_request_count_delete`

2. **Stored Procedure**: `promote_next_buyer(marketplace_book_id)`
   - Automatically promotes next buyer in queue
   - Updates marketplace status
   - Called on request cancellation

## Installation Steps

### Step 1: Run Database Migration

```bash
# Connect to your MySQL database
mysql -u your_username -p library

# Run the migration script
source C:/xampp/htdocs/Lib/Lib/lib/server/migrations/marketplace_request_queue.sql

# Or if using phpMyAdmin, import the SQL file
```

**Important**: The migration will:
- Create the `book_requests` table
- Add new columns to `used_books_marketplace`
- Migrate existing data
- Create triggers and stored procedures

### Step 2: Verify Migration

```sql
-- Check if book_requests table exists
SHOW TABLES LIKE 'book_requests';

-- Verify new columns in used_books_marketplace
DESCRIBE used_books_marketplace;

-- Verify triggers
SHOW TRIGGERS;

-- Verify stored procedure
SHOW PROCEDURE STATUS WHERE Name = 'promote_next_buyer';
```

### Step 3: Update Backend Routes

The updated `server/routes/sellBooks.js` file includes:
- ✅ Enhanced GET `/sell-books` with queue info
- ✅ POST `/sell-books/request` - Add to request queue
- ✅ POST `/sell-books/cancel-request` - Cancel with auto-promotion
- ✅ POST `/sell-books/mark-sold` - Seller marks as sold
- ✅ POST `/sell-books/confirm-receive` - Buyer confirms receipt
- ✅ GET `/sell-books/my-requests` - Get user's requested books

### Step 4: Update Frontend

The updated `src/Pages/MainPage.jsx` includes:
- ✅ New "Requested Books" tab in sidebar
- ✅ Enhanced marketplace view with queue display
- ✅ Request management buttons
- ✅ Transaction status indicators
- ✅ Badge count for requested books

### Step 5: Update CSS

The updated `src/Pages/MainPage.css` includes:
- ✅ Request queue styling
- ✅ Priority buyer badges
- ✅ Enhanced button styles
- ✅ Status indicators
- ✅ Responsive design for mobile

## API Endpoints

### For Buyers

#### 1. Request to Buy
```javascript
POST /sell-books/request
Body: { id: marketplace_book_id }
Response: { message, position }
```

#### 2. Cancel Request
```javascript
POST /sell-books/cancel-request
Body: { id: marketplace_book_id }
Response: { message, wasPriorityBuyer }
```

#### 3. Confirm Receipt
```javascript
POST /sell-books/confirm-receive
Body: { id: marketplace_book_id }
Response: { message, transactionComplete }
```

#### 4. Get My Requests
```javascript
GET /sell-books/my-requests
Response: Array of requested books with queue positions
```

### For Sellers

#### 1. Mark as Sold
```javascript
POST /sell-books/mark-sold
Body: { id: marketplace_book_id }
Response: { message }
```

#### 2. Get All Listings
```javascript
GET /sell-books
Response: Array of books with requesters array
```

## User Flow Examples

### Scenario 1: Single Buyer
1. User A lists a book (status: `available`)
2. User B requests the book (status: `requested`, User B is priority)
3. User A marks as sold (status: `sold`)
4. User B confirms receipt (status: `completed`, removed from marketplace)

### Scenario 2: Multiple Buyers with Cancellation
1. User A lists a book (status: `available`)
2. User B requests first (position: 1, priority: true)
3. User C requests second (position: 2, priority: false)
4. User D requests third (position: 3, priority: false)
5. User B cancels → User C auto-promoted to position 1 (priority: true)
6. User A marks as sold to User C
7. User C confirms receipt → transaction complete

### Scenario 3: Buyer Joining Queue
1. Book already has 2 requesters
2. User E requests → automatically added to position 3
3. User E sees "Position in queue: 3" in "Requested Books" tab
4. If users 1 and 2 cancel, User E auto-promotes to position 1

## UI Components

### Marketplace View
- **For Sellers**:
  - Request count badge
  - List of all requesters with timestamps
  - Priority buyer highlighted
  - "Mark as Sold" button

- **For Buyers**:
  - "Request to Buy" or "Join Queue" button
  - Queue position indicator
  - "Cancel Request" option
  - "Confirm Received" button (when seller marks sold)

### Requested Books Tab
- Shows all active requests
- Queue position for each request
- Priority buyer indicator (🎯)
- Transaction status
- Cancel or Confirm buttons based on status

### Sidebar
- New "Requested Books" navigation item
- Badge showing count of active requests
- Icon: 📥

## Testing Checklist

### Basic Flow
- [ ] User can list a book for sale
- [ ] Another user can request the book
- [ ] Request appears in "Requested Books" tab
- [ ] Seller sees requester in marketplace view
- [ ] Seller can mark as sold
- [ ] Buyer can confirm receipt
- [ ] Book disappears after completion

### Queue Management
- [ ] Multiple users can request same book
- [ ] Requesters appear in order (by timestamp)
- [ ] First requester is marked as priority
- [ ] Seller sees all requesters with positions
- [ ] Buyers see their queue position

### Cancellation & Promotion
- [ ] Buyer can cancel request
- [ ] Non-priority buyer cancellation doesn't affect queue
- [ ] Priority buyer cancellation promotes next in queue
- [ ] Next buyer becomes priority automatically
- [ ] Seller view updates to show new priority buyer

### Edge Cases
- [ ] User cannot request own listing
- [ ] User cannot request same book twice
- [ ] Only priority buyer can confirm receipt
- [ ] Only seller can mark as sold
- [ ] Completed transactions removed from marketplace

## Troubleshooting

### Issue: Triggers not working
**Solution**: Ensure you have TRIGGER privilege
```sql
GRANT TRIGGER ON library.* TO 'your_username'@'localhost';
FLUSH PRIVILEGES;
```

### Issue: Stored procedure fails
**Solution**: Check if procedure exists and has correct syntax
```sql
SHOW PROCEDURE STATUS WHERE Db = 'library';
CALL promote_next_buyer(1); -- Test with a valid ID
```

### Issue: Request queue not updating
**Solution**: Check if triggers are active
```sql
SHOW TRIGGERS FROM library WHERE `Table` = 'book_requests';
```

### Issue: Frontend not showing requesters
**Solution**: Check browser console for errors and verify API response
```javascript
// In browser console
fetch('http://localhost:5000/sell-books', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
```

## Database Maintenance

### Clear Completed Transactions (Optional)
```sql
-- Archive completed transactions (older than 30 days)
DELETE FROM book_requests
WHERE status = 'completed'
AND completed_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

DELETE FROM used_books_marketplace
WHERE status = 'completed'
AND completed_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### Monitor Queue Performance
```sql
-- Check books with most requests
SELECT
  m.title,
  COUNT(br.id) as request_count
FROM used_books_marketplace m
LEFT JOIN book_requests br ON m.id = br.marketplace_book_id
WHERE br.status = 'active'
GROUP BY m.id
ORDER BY request_count DESC
LIMIT 10;
```

## Security Considerations

1. **Session Validation**: All endpoints check `req.session.user`
2. **Authorization**: Users can only manage their own requests
3. **SQL Injection**: All queries use parameterized statements
4. **XSS Protection**: React automatically escapes user content

## Future Enhancements

- [ ] Email notifications when promoted to priority buyer
- [ ] In-app notifications for queue updates
- [ ] Seller ability to choose buyer (not just FIFO)
- [ ] Request expiration after N days
- [ ] Analytics dashboard for marketplace activity
- [ ] Rating system for completed transactions
- [ ] WhatsApp integration for direct messaging

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the server logs for backend errors
3. Verify database triggers and procedures are active
4. Ensure migrations ran successfully

## License

This implementation is part of the Library Management System.

---

**Created**: 2025-01-XX
**Version**: 1.0.0
**Status**: Production Ready
