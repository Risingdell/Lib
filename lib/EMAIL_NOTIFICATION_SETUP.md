# Email Notification Setup Guide

## Overview

The library management system now sends automated email notifications to users when their registration is approved by an admin. This feature uses **Nodemailer** with Gmail SMTP service.

---

## Features Implemented

### ✅ Email Notifications
- **Registration Approval Email**: Sent automatically when admin approves a user's registration
- **Beautiful HTML Template**: Professional email design with responsive layout
- **Plain Text Fallback**: For email clients that don't support HTML
- **Non-blocking**: Email sending doesn't block the approval process

### ✅ Search Functionality
- **Student Dashboard**: Search books by title, author, acc no, or donor
- **Admin Dashboard**: Search members by name, username, USN, email, or ID

---

## Gmail Setup (REQUIRED)

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", select **2-Step Verification**
4. Follow the prompts to enable 2FA

### Step 2: Generate App Password

1. After enabling 2FA, go back to **Security**
2. Under "Signing in to Google", select **App passwords**
3. You may need to sign in again
4. Click **Select app** → Choose **Mail**
5. Click **Select device** → Choose **Other (Custom name)**
6. Enter "Library Management System"
7. Click **Generate**
8. **Copy the 16-character password** (shown without spaces)
9. Save this password - you'll need it for the `.env` file

---

## Backend Configuration

### Step 1: Environment Variables

Add these variables to your `.env` file in the `server` folder:

```env
# Email Configuration
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASSWORD=your-16-character-app-password

# Frontend URL (for email links)
FRONTEND_URL=https://your-app.vercel.app
```

**Example:**
```env
EMAIL_USER=libraryapp@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
FRONTEND_URL=https://lib-jvvif5qwl-risingdells-projects.vercel.app
```

### Step 2: Deployment (Render)

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add the environment variables:
   - `EMAIL_USER` → Your Gmail address
   - `EMAIL_PASSWORD` → Your 16-character app password
   - `FRONTEND_URL` → Your Vercel frontend URL
5. Click **Save Changes**
6. Render will automatically redeploy

---

## Files Modified/Created

### New Files:

1. **`server/utils/emailService.js`**
   - Email sending utility
   - HTML email template for approval notification
   - Uses Nodemailer with Gmail SMTP

### Modified Files:

1. **`server/routes/admin.js`**
   - Lines 4: Import email service
   - Lines 185: Updated to fetch user email and name
   - Lines 214-224: Send email after approval

2. **`src/Pages/MainPage.jsx`**
   - Line 30: Added `bookSearchQuery` state
   - Lines 331-341: Filter books based on search
   - Lines 347-403: Search bar UI with clear button
   - Lines 428-432: Empty state for no results

3. **`src/Pages/AdminDashboard.jsx`**
   - Line 22: Added `memberSearchQuery` state
   - Lines 423-436: Filter members based on search
   - Lines 442-498: Search bar UI with clear button
   - Lines 500-502: Empty state for no results

4. **`server/package.json`**
   - Added `nodemailer` dependency

---

## Testing the Email Functionality

### Local Testing:

1. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Check for email configuration errors:**
   - Look for any errors in the console about missing `EMAIL_USER` or `EMAIL_PASSWORD`

3. **Test approval flow:**
   - Register a new user
   - Login as admin
   - Approve the user's registration
   - Check the registered email for approval notification

### Production Testing:

1. **Verify environment variables on Render:**
   - All three email variables should be set
   - No typos in the email address or app password

2. **Check Render logs:**
   ```
   ✅ Approval email sent successfully to: user@example.com
   Message ID: <message-id@gmail.com>
   ```

3. **If email fails:**
   - User approval still succeeds (non-blocking)
   - Check logs for error message:
   ```
   ❌ Error sending approval email: [error details]
   Email notification failed for user: username [error]
   ```

---

## Email Template Features

### What the Email Contains:

1. **Header**
   - Gradient blue background
   - "🎉 Account Approved!" title

2. **Personalized Greeting**
   - "Hello [First Name] [Last Name]!"

3. **Account Details Box**
   - Username
   - Email address

4. **Features List**
   - Browse books
   - Borrow up to 2 books
   - Track borrowing history
   - Request new books
   - Manage profile

5. **Call-to-Action Button**
   - "Login Now →" button
   - Links directly to login page

6. **Footer**
   - Library Management System branding
   - "Do not reply" notice

---

## Troubleshooting

### Issue 1: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Cause:** Using regular Gmail password instead of App Password

**Fix:**
1. Make sure 2FA is enabled
2. Generate a new App Password (Step 2 above)
3. Use the 16-character App Password in `EMAIL_PASSWORD`

---

### Issue 2: Emails not sending in production

**Possible Causes:**
1. Environment variables not set on Render
2. Wrong Gmail credentials
3. Gmail blocking sign-in attempts

**Fix:**
1. Check Render environment variables
2. Verify credentials are correct
3. Check Gmail security alerts: https://myaccount.google.com/notifications
4. Enable "Less secure app access" if prompted

---

### Issue 3: Emails going to spam

**Cause:** Gmail may flag automated emails as spam

**Fix:**
1. User should check spam/junk folder
2. Mark as "Not Spam"
3. Add library email to contacts
4. Consider using a professional email service (SendGrid, AWS SES) for production

---

### Issue 4: Email sending but user not receiving

**Possible Causes:**
1. Wrong email address in database
2. Email blocked by recipient's email provider
3. Email in spam folder

**Fix:**
1. Verify user's email in database
2. Check server logs for successful send confirmation
3. Ask user to check spam folder
4. Try with different email provider (Gmail, Yahoo, Outlook)

---

## Security Best Practices

### ✅ DO:
- Use App Passwords, not regular Gmail password
- Keep `.env` file in `.gitignore`
- Use environment variables in production
- Rotate App Passwords periodically
- Use a dedicated Gmail account for the app

### ❌ DON'T:
- Commit `.env` file to GitHub
- Share your App Password
- Use your personal Gmail account
- Hard-code credentials in the code
- Enable "Less secure app access" (use App Passwords instead)

---

## Advanced Configuration

### Using Custom SMTP Server

If you want to use a different email provider:

```javascript
// In server/utils/emailService.js
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};
```

### Popular Email Services:

**SendGrid:**
```javascript
host: 'smtp.sendgrid.net'
port: 587
```

**AWS SES:**
```javascript
host: 'email-smtp.us-east-1.amazonaws.com'
port: 587
```

**Outlook/Hotmail:**
```javascript
service: 'hotmail'
```

---

## Email Analytics (Optional)

To track email opens and clicks, consider:

1. **SendGrid** - Free tier includes analytics
2. **Mailgun** - Detailed delivery tracking
3. **AWS SES** - Integrates with CloudWatch

---

## Future Enhancements

Potential email notification features:

1. **Overdue Book Reminders**
   - Send reminder 1 day before due date
   - Send overdue notice

2. **Book Return Confirmation**
   - Email when return is approved
   - Thank you message

3. **New Book Notifications**
   - Notify users when new books are added
   - Subscribe to specific authors/genres

4. **Welcome Email**
   - Send immediately after registration
   - Explain approval process

5. **Password Reset**
   - Forgot password functionality
   - Secure reset link

---

## Search Functionality

### Student Dashboard - Book Search

**Features:**
- Search by title, author, acc no, or donor name
- Real-time filtering
- Clear button to reset search
- Shows "No books found" message

**Usage:**
1. Go to "Available Books" tab
2. Type in search box
3. Results filter automatically
4. Click "Clear" to reset

### Admin Dashboard - Member Search

**Features:**
- Search by name, username, USN, email, or ID
- Real-time filtering
- Clear button to reset search
- Shows "No members found" message

**Usage:**
1. Go to "Members" tab
2. Type in search box
3. Results filter automatically
4. Click "Clear" to reset

---

## Summary

✅ **Email Notifications:** Automatically sent when admin approves registration
✅ **Search Functionality:** Added to both student and admin dashboards
✅ **Non-blocking:** Email failures don't affect approval process
✅ **Professional Design:** Beautiful HTML email template
✅ **Easy Configuration:** Just set 3 environment variables

**Setup Time:** 10-15 minutes
**Dependencies:** nodemailer (already installed)
**Cost:** Free with Gmail

---

## Support

If you encounter issues:

1. **Check Render logs** for error messages
2. **Verify environment variables** are set correctly
3. **Test with different email addresses**
4. **Check Gmail security alerts**
5. **Review this documentation**

---

**Last Updated:** 2025-10-24
**Status:** ✅ Complete and ready for deployment

---

Good luck! 🚀
