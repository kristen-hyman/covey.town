## How the features were implemented in the frontend:

1. New frontend components in `frontend/src/components/Login`:
   - LoginHooks: implements the google sign-in button and its functionality(setting location to Lobby and online status).
   - LogoutHooks: implements the logout button on its functionality
     (removing location and setting offline status)
2. Townselection.tsx was altered in several ways:

   - It now renders the new LoginHooks and LogoutHooks components. Now the user can easily sign in with Google or continue using the application as before without signing in. One alternative that was considered was creating an entirely separate login page, but that was overlooked as it prevented users who did not wish to sign in access, or added an extra step in their interaction with the application.
   - A friends table is now rendered which displays a user's friends with their email address, and their online status, and location within the app (the town which they are in), as well as a button for removing the friend from the user’s list. - This only appears after successful login with a welcome message at the top.

3. EndCallButton.tsx is altered to send a location request to the database in order to have the most up to date location for a player. Players that are logged in but not in a town, are by default placed into the main lobby of covey.town. In order to track when a user leaves a room, we modified this file to allow the database to update with the user’s location as ‘Lobby’ since they leave a room once they click on it. There were no significant alternatives to this choice, as maintaining consistency and the most up to date information in the database was given preference.

## How the new features were implemented in the backend.

The new architecture of the app:
![Covey.Town Architecture](docs/arch.png)

1. A new service was created, called databaseService
