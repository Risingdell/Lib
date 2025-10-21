# HOW TO IMPORT DATABASE TO CLEVER CLOUD

You have Clever Cloud credentials, but we're having connection issues from your local machine. Here are **3 easy methods** to import your database:

---

## METHOD 1: Using Clever Cloud Console (EASIEST) ⭐

### Step 1: Login to Clever Cloud
1. Go to https://console.clever-cloud.com/
2. Login with your account
3. Click on your MySQL addon: `bfjxqdkabitgzq9zhbfo`

### Step 2: Use phpMyAdmin
1. In your MySQL addon dashboard, look for **"phpMyAdmin"** link
2. Click to open phpMyAdmin
3. Login credentials will be auto-filled

### Step 3: Import the Schema
1. Click **"Import"** tab at the top
2. Click **"Choose File"**
3. Select: `C:\xampp\htdocs\Lib\Lib\lib\library_schema.sql`
4. Scroll down and click **"Import"**
5. Wait for completion (should take ~30 seconds)

### Step 4: Add Sample Data (Optional)
Run these SQL queries in phpMyAdmin SQL tab:

```sql
-- Add test admin
DELETE FROM admins WHERE username = 'admin';
INSERT INTO admins (name, username, password)
VALUES ('Admin', 'admin', 'admin123');

-- Add sample books
INSERT INTO books (sl_no, acc_no, title, author, donated_by, date, status)
VALUES
(1, 1001, 'Introduction to Algorithms', 'Thomas H. Cormen', 'College Library', '2024-01-01', 'available'),
(2, 1002, 'Clean Code', 'Robert C. Martin', 'College Library', '2024-01-01', 'available'),
(3, 1003, 'Design Patterns', 'Gang of Four', 'College Library', '2024-01-01', 'available');
```

**Done!** ✅

---

## METHOD 2: Using MySQL Workbench

### Step 1: Download MySQL Workbench
- Download from: https://dev.mysql.com/downloads/workbench/
- Install if you haven't already

### Step 2: Create New Connection
1. Open MySQL Workbench
2. Click **"+"** next to **"MySQL Connections"**
3. Fill in details:
   - **Connection Name**: Clever Cloud Library
   - **Hostname**: `bfjxqdkabitgzq9zhbfo-mysql.services.clever-cloud.com`
   - **Port**: `3306`
   - **Username**: `uyj5f9tam7xflp46`
   - **Password**: Click **"Store in Keychain"** → Enter: `5AjTm0cxV1SDn6ctQGsx`
   - **Default Schema**: `bfjxqdkabitgzq9zhbfo`
4. Click **"Test Connection"**
5. If successful, click **"OK"**

### Step 3: Import Schema
1. Click on the new connection to open it
2. Go to **Server** → **Data Import**
3. Select **"Import from Self-Contained File"**
4. Browse to: `C:\xampp\htdocs\Lib\Lib\lib\library_schema.sql`
5. Under **"Default Target Schema"**, select: `bfjxqdkabitgzq9zhbfo`
6. Click **"Start Import"**

### Step 4: Verify
1. In the left panel, click **refresh** icon
2. You should see 7 tables:
   - admins
   - book_requests
   - books
   - borrowed_books
   - selling_books
   - used_books_marketplace
   - users

**Done!** ✅

---

## METHOD 3: Using Clever Cloud CLI

### Step 1: Install Clever Cloud CLI
```bash
npm install -g clever-cloud
```

### Step 2: Login
```bash
clever login
```

### Step 3: Link Your Addon
```bash
clever link -o [your-organization] -a [your-app-id]
```

### Step 4: Import Database
```bash
clever mysql import < C:\xampp\htdocs\Lib\Lib\lib\library_schema.sql
```

---

## VERIFICATION STEPS

After importing using any method:

### 1. Check Tables Created
Run this SQL in phpMyAdmin or MySQL Workbench:

```sql
SHOW TABLES;
```

You should see 7 tables.

### 2. Check Table Structures
```sql
DESCRIBE users;
DESCRIBE books;
DESCRIBE admins;
```

### 3. Verify No Data Loss
```sql
SELECT COUNT(*) FROM admins;  -- Should be > 0 if you added test data
SELECT COUNT(*) FROM books;   -- Should be 3 if you added sample books
```

---

## YOUR CLEVER CLOUD CREDENTIALS

Save these somewhere secure:

```
Host: bfjxqdkabitgzq9zhbfo-mysql.services.clever-cloud.com
Database: bfjxqdkabitgzq9zhbfo
User: uyj5f9tam7xflp46
Password: 5AjTm0cxV1SDn6ctQGsx
Port: 3306
```

**Connection URI:**
```
mysql://uyj5f9tam7xflp46:5AjTm0cxV1SDn6ctQGsx@bfjxqdkabitgzq9zhbfo-mysql.services.clever-cloud.com:3306/bfjxqdkabitgzq9zhbfo
```

---

## TROUBLESHOOTING

### Issue: "Table already exists"
**Solution**: The import script has `DROP TABLE IF EXISTS` commands, so this shouldn't happen. If it does:
1. Delete all tables first
2. Re-run the import

### Issue: "Foreign key constraint fails"
**Solution**: The import script disables FK checks. If using method 2 or 3:
1. Run this first:
   ```sql
   SET FOREIGN_KEY_CHECKS = 0;
   ```
2. Import the schema
3. Run this after:
   ```sql
   SET FOREIGN_KEY_CHECKS = 1;
   ```

### Issue: "Access denied"
**Solution**: Double-check credentials from Clever Cloud dashboard

---

## NEXT STEPS AFTER IMPORT

Once database is imported successfully:

✅ **Database Ready!** → Proceed to Cloudinary setup
✅ **Schema File Location**: `C:\xampp\htdocs\Lib\Lib\lib\library_schema.sql`
✅ **Test Admin**: username: `admin`, password: `admin123`

Continue with deployment guide: `DEPLOYMENT_QUICK_START.md` → Step 2 (Cloudinary)

---

## RECOMMENDED METHOD

**For quickest results**: Use **METHOD 1** (Clever Cloud Console + phpMyAdmin)
- No additional software needed
- Already logged in
- Direct access from browser
- Easiest for beginners

**Time required**: 5-10 minutes

Good luck! 🚀
