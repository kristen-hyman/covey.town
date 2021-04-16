# Overview of features

The features added to covey.town are as follows (these correspond to user stories):

1. Users have the ability to log in to Covey Town using their google account. (User Story 1)
2. The application has persistence, namely that it can store and retrieve certain information about a user (User Story 2 and User Story 3)
3. Users can store a friends list on their profile. This friends list includes people who also have used covey.town with the Google sign-in, and are added by the user to their list of friends. (User Story 2).
   - The user must add friends by using their exact email address which their friends have used to login into covey.town (with Google).
4. The friends list is presented to the user on the front end, and gives the user information about their friends including their online status and location on the site(townID). (User Story 2)
   Users can delete friends from their friend list at any time using the trash-can icon to the right of the friend’s information.
   - All additions/deletions from friend lists are saved in between sessions. (User Story 3)
   - All status updates of a users friends such as their online status and location are updated live on the front end.
5. All baseline functionally (creating towns, joining towns, creating private towns etc.) remains fully functional as before.

# User interaction with features

## Login through Google

1. On the CoveyTown homepage/login, the user will find a Google Sign-In button. Upon clicking that button, the user will be redirected to a pop-up that is monitored and operated through Google’s Sign-in authentication system.
2. They will either log in with their Google credentials, or select an existing profile that is logged in.
3. Upon clicking their profile, they will receive a notification about whether the login was successful or not.
4. If successful, they will be able to see their friends list populate with existing profiles they have added in as friends, as well as a status indicating whether their friends are currently online or not. This will also display the location of their friends within the application (providing the townID that the user is currently in). The program also posts a friendly message on the homepage using the name associated with the user’s account. (Please note that after your first log in with your personal account the friends list will be empty. In that case, you can add waleedhumayon@gmail.com to your friends in order to test the functionality. This is an existing user on the database.)

## Using the friends list

5. The friends list will initially come up empty, with a search bar that will allow the user to enter an email of a friend that is also a user of covey.town. If the friend is a user of covey.town that has logged in before, they will successfully be able to add them into the friends list. If not, the user will receive a message stating that they were unable to add that friend.
6. Once a friend has been added to the list, the user can see their email, their activity status (online - green dot, offline - red dot), and their location (lobby - if they are logged in and not actively in a room, room ID if they are actively in a room).
7. The user will also see a delete icon next to each friend, which they can use to remove that friend from their friends list. This will persist through multiple logins, which complies with the goal of persistence.

## Original features not altered in any way

8. Users can then create a new town by entering a name for the town, which will automatically join them to the town.
9. Users may also use the town table for existing towns and click the join button to enter them.
10. Finally, the user can also enter the town ID in the search box, and click connect to join the town.
11. All the video/audio chat features inside the towns is unchanged.
