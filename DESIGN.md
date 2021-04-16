## How the features were implemented in the frontend:

1. New frontend components in `frontend/src/components/Login`:
   - LoginHooks: implements the google sign-in button and its functionality (setting location to 'Lobby' and online status).
   - LogoutHooks: implements the logout button on its functionality (removing location and setting offline status).
   - User: implements a singleton to keep track of user information such as their online status, email and name.
2. New frontend component in `frontend/src/classes`:
   - DatabaseServiceClient constructs a database API client that enables users to send payloads to the backend through axios in order to create/read/updated/delete data on the database.
3. Townselection.tsx was altered in several ways:
   - It now renders the new LoginHooks and LogoutHooks components. Now the user can easily sign in with Google or continue using the application as before without signing in. One alternative that was considered was creating an entirely separate login page, but that was overlooked as it prevented users who did not wish to sign in access, or added an extra step in their interaction with the application.
   - A friends table is now rendered which displays a user's friends with their email address, and their online status, and location within the app (the town which they are in), as well as a button for removing the friend from the user’s list. - This only appears after successful login with a welcome message at the top.
4. EndCallButton.tsx is altered to send a location request to the database in order to have the most up to date location for a player. Players that are logged in but not in a town, are by default placed into the main lobby of covey.town. In order to track when a user leaves a room, we modified this file to allow the database to update with the user’s location as ‘Lobby’ since they leave a room once they click on it. There were no significant alternatives to this choice, as maintaining consistency and the most up to date information in the database was given preference.

## How the new features were implemented in the backend:

The new architecture of the app can be found [here](docs/arch.png)

1. A new service called `databaseService` was created. It is a RESTful service implemented using express which connects to our MongoDB cluster and serves requests from the front end.
2. All the routes are defined in `services/databaseService/src/router/database.ts`, their functionality defined in `src/requestHandlers/DBRequestHandlers.ts`. Whenever a request is made to this service it connects to the MongoDB cluster and executes CRUD operations on behalf of the frontend and returns a response to the frontend.

## Third party services used:

### Google Sign In

The decision to use Google Sign in was made because it is third-party sign in option widely used industry. Moreover, we found that the Google Sign-in API had good documentation and its implementation easily fit into our current architecture.

### MongoDB

We decided to use a NoSQL database over a relational database because of the ease of use and flexibility to store unstructured data such as a list of friends. We use a hosted cluster offered by MongoDB called [Atlas](https://www.mongodb.com/cloud/atlas).
