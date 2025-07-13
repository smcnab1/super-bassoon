# Authentication System

This application includes a secure password protection system with SHA-256 hashing, similar to the one used in the [UWLSimulationCentre/SimEPR-SimWard-Staff-Course](https://github.com/UWLSimulationCentre/SimEPR-SimWard-Staff-Course) repository.

## How It Works

1. **Login Screen**: When users first visit the application, they see a login screen
2. **Password Protection**: Users must enter the correct password to access the application
3. **Secure Hashing**: Passwords are hashed using SHA-256 before comparison
4. **Session Management**: Once authenticated, users remain logged in until they close the browser or logout
5. **Protected Pages**: All pages in the application are protected and redirect to login if not authenticated

## Default Password

The default password is: **`MScSimEd2025`**

## How to Change the Password

### Step 1: Generate a New Hash
1. Go to [SHA-256 Hash Generator](https://emn178.github.io/online-tools/sha256.html)
2. Enter your new password in the text field
3. Copy the generated hash (64 characters long)

### Step 2: Update the Configuration
1. Open `config.js`
2. Replace the `PASSWORD_HASH` value with your new hash:
   ```javascript
   const CONFIG = {
     PASSWORD_HASH: 'your_new_hash_here_64_characters_long',
     // ... other settings
   };
   ```

### Step 3: Update auth.js (if needed)
1. Open `auth.js`
2. Replace the `CORRECT_PASSWORD_HASH` value with the same hash:
   ```javascript
   const CORRECT_PASSWORD_HASH = 'your_new_hash_here_64_characters_long';
   ```

## Security Features

- **SHA-256 Hashing**: Passwords are never stored in plain text
- **Secure Comparison**: Password comparison is done using cryptographic hashes
- **Session Storage**: Authentication persists during the browser session
- **Automatic Redirect**: Unauthenticated users are redirected to login
- **Logout Function**: Users can logout manually using the 🚪 button
- **Complete Data Reset**: Logout clears all stored data except theme preference
- **No Server Required**: Works entirely client-side
- **GitHub Safe**: Password hashes are safe to commit to public repositories

## Files Involved

- `index.html` - Main login page and application
- `auth.js` - Authentication logic for protected pages
- `config.js` - Configuration file with password hash
- `timetable/generate.html` - Protected page
- `timetable/preset/new.html` - Protected page
- `timetable/preset/edit.html` - Protected page

## Adding Protection to New Pages

To protect a new page:

1. Add the authentication script to the HTML head:
   ```html
   <script src="path/to/auth.js"></script>
   ```

2. The script will automatically:
   - Check authentication on page load
   - Redirect to login if not authenticated
   - Add a logout button to the navbar

## Browser Compatibility

- Works in all modern browsers
- Uses `crypto.subtle.digest()` for SHA-256 hashing
- Uses `sessionStorage` for session management
- No external dependencies required

## Security Notes

- This is a **client-side only** authentication system
- Passwords are stored as SHA-256 hashes, not plain text
- The hash cannot be reversed to get the original password
- Safe to use in public repositories
- For production use, consider implementing server-side authentication
- The session expires when the browser is closed

## Logout Behavior

When users click the logout button (🚪), the system:

1. **Clears all session storage** - Removes authentication and any session-specific data
2. **Clears all local storage** - Removes all saved data including:
   - Form drafts and unsaved work
   - Current preset selections
   - JSON import content
   - Collapsed/expanded section states
   - Any other application state
3. **Preserves theme preference** - Keeps the user's light/dark theme choice
4. **Redirects to login** - Returns to the login screen

This ensures that when users log back in, they start with a completely fresh application state.

## Troubleshooting

### Password not working
- Verify the hash was generated correctly
- Check that you've updated the hash in both `config.js` and `auth.js`
- Clear your browser's session storage
- Try refreshing the page

### Pages not redirecting
- Ensure `auth.js` is included in the HTML head
- Check that the file paths are correct
- Verify the authentication check is running

### Logout button not appearing
- Check that the navbar has the class `.navbar-links`
- Ensure `auth.js` is loaded before the DOM content
- Verify there are no JavaScript errors in the console

### Hash generation issues
- Use the recommended SHA-256 generator: https://emn178.github.io/online-tools/sha256.html
- Ensure the hash is exactly 64 characters long
- Copy the entire hash without any extra spaces 