# Quick Start Guide - Enhanced Marketplace

## 🚀 Quick Setup (5 minutes)

### Step 1: Run Database Migration
```bash
# Open your MySQL/phpMyAdmin
# Import this file: server/migrations/marketplace_request_queue.sql
```

**OR** via command line:
```bash
mysql -u root -p library < server/migrations/marketplace_request_queue.sql
```

### Step 2: Restart Backend Server
```bash
cd server
npm install  # If needed
node index.js
```

### Step 3: Restart Frontend
```bash
cd ..
npm install  # If needed
npm run dev
```

### Step 4: Test It!
1. Login as User A
2. Go to "Sell Book" tab
3. List a book for sale
4. Login as User B (different browser/incognito)
5. Go to "Marketplace" tab
6. Click "Request to Buy"
7. Check "Requested Books" tab (should show your request)
8. Switch back to User A
9. See User B in the request queue
10. Click "Mark as Sold"
11. Switch to User B
12. Click "Confirm Received"
13. ✅ Transaction complete!

## 📋 What Changed?

### Database
- ✅ New `book_requests` table
- ✅ Enhanced `used_books_marketplace` table
- ✅ 3 triggers for auto-updating request counts
- ✅ 1 stored procedure for queue promotion

### Backend (`server/routes/sellBooks.js`)
- ✅ Enhanced GET `/sell-books` - returns request queue
- ✅ POST `/sell-books/request` - handles multiple requesters
- ✅ POST `/sell-books/cancel-request` - auto-promotes next buyer
- ✅ POST `/sell-books/mark-sold` - seller marks as sold
- ✅ POST `/sell-books/confirm-receive` - buyer confirms receipt
- ✅ GET `/sell-books/my-requests` - user's requested books

### Frontend (`src/Pages/MainPage.jsx`)
- ✅ New "Requested Books" tab with badge count
- ✅ Enhanced marketplace cards showing queue
- ✅ Request/Cancel/Confirm buttons
- ✅ Status indicators for sellers and buyers

### CSS (`src/Pages/MainPage.css`)
- ✅ Queue list styling
- ✅ Priority buyer badges
- ✅ New button styles
- ✅ Status color coding

## 🎯 Key Features

### For Sellers:
- See all buyers who requested your book
- Queue ordered by who requested first
- Priority buyer highlighted with 🎯 badge
- One-click "Mark as Sold" to active buyer

### For Buyers:
- Request any available or already-requested book
- See your position in queue
- Get priority when others cancel
- Confirm receipt after seller marks as sold
- Track all your requests in one place

## 🔄 Transaction Statuses

| Status | Description | Seller View | Buyer View |
|--------|-------------|-------------|------------|
| `available` | No requests yet | "Remove Listing" | "Request to Buy" |
| `requested` | Has active requests | "Mark as Sold" + Queue | "Join Queue" / "Cancel Request" |
| `sold` | Seller marked as sold | "Waiting for buyer..." | "Confirm Received" (priority buyer only) |
| `completed` | Transaction done | Shows "Completed" | Removed from marketplace |

## ⚠️ Important Notes

1. **First-Come-First-Served**: Requests are queued by timestamp
2. **Auto-Promotion**: When #1 cancels, #2 becomes #1 automatically
3. **Two-Step Completion**:
   - Seller marks as "Sold"
   - Then buyer confirms "Received"
   - Both steps required to complete transaction
4. **No Duplicate Requests**: User can't request same book twice

## 🐛 Quick Troubleshooting

### Requesters not showing?
- Check browser console for errors
- Verify `/sell-books` endpoint returns `requesters` array
- Ensure migration ran successfully

### Queue not promoting?
- Check if stored procedure exists: `SHOW PROCEDURE STATUS`
- Test manually: `CALL promote_next_buyer(1)`
- Check trigger status: `SHOW TRIGGERS`

### Buttons not working?
- Check server logs for API errors
- Verify user session is active
- Ensure book status matches expected state

## 📞 Need Help?

Check the full documentation: `MARKETPLACE_SETUP_README.md`

## ✅ Verification Checklist

- [ ] Migration SQL ran without errors
- [ ] `book_requests` table exists
- [ ] Triggers created (3 total)
- [ ] Stored procedure `promote_next_buyer` exists
- [ ] Backend server running
- [ ] Frontend running
- [ ] Can list a book
- [ ] Can request a book
- [ ] Request appears in "Requested Books" tab
- [ ] Seller sees requester in queue
- [ ] Can complete full transaction flow

---

**Setup Time**: ~5 minutes
**Difficulty**: Beginner
**Status**: Ready for Production
