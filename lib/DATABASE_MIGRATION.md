# Database Migration for Profile Image Feature

## Required Database Changes

To enable the profile image upload feature, you need to add a column to your `users` table in the `library` database.

### Migration SQL

Run this SQL command in your MySQL database:

```sql
ALTER TABLE users
ADD COLUMN profile_image VARCHAR(500) NULL
COMMENT 'Stores the path to user profile image';
```

### Column Details

- **Column Name**: `profile_image`
- **Data Type**: `VARCHAR(500)`
- **Nullable**: `YES` (NULL by default)
- **Default Value**: `NULL`
- **Description**: Stores the relative path to the user's profile image (e.g., `/uploads/profile-images/profile-1-1234567890.jpg`)

### Alternative Option (for longer URLs)

If you prefer to store full URLs or need more space:

```sql
ALTER TABLE users
ADD COLUMN profile_image TEXT NULL
COMMENT 'Stores the URL or path to user profile image';
```

## Verification

After running the migration, verify the column was added:

```sql
DESCRIBE users;
```

You should see the new `profile_image` column in the table structure.

## Rollback (if needed)

If you need to remove this column:

```sql
ALTER TABLE users
DROP COLUMN profile_image;
```

## Notes

- The column is nullable, so existing users will have `NULL` by default
- Images are stored in `server/uploads/profile-images/` directory
- The database stores only the path, not the actual image data
- Images are served statically via the `/uploads` route
