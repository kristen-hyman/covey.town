import CORS from 'cors';
import Express from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import addDBRoutes from '../router/database';
import DatabaseServiceClient from './DatabasesServiceClient';



/**
   * Testing:
   * 
   * KRISTEN
   * addUser
   * adding a user to database with all appropriate parameters works
   * Allows for multiple users with the same first and last names as long as email is dif
   *
   * userExistence
   * adding an nonexisting user to empty friendlist does not work
   * adding a nonexisting user to non empty friendlist does not work
   * user that is not in database hwen queried w/ userExistence should return false
   * user in database wehn queried w/ userExistence shoudl return false
   * after deletion, userExistence for deleted user should return false
   * after adding, userExistence should return true
   * 
   * 
   *GERARD
   * setOnlineStatus and getOnlineStatus
   * // look into how to invoke closing the tab to see if it changes to offline for these tests?
   * signing online changes a users status to true
   * signing offline changes a users status to offline
   * signing offline changes a users status to offline for people who have them as friends on their friendlists
   * signing online changes a users status to offline for people who have them as friends on their friendlists
   * 
   * setUserLocation
   * // look into how to invoke closing tab?
   * 
   * sign in and check userLocation before and after to confirm change (using user.location)
   * sign out and check userLocation before and after to confirm change (using user.location)
   * close tab and check userLocation before and after to confirm change (using user.location)
   * join/create room and check userLocation before and after to confirm change (using user.location)
   * leave room and check userLocation before and after to confirm change (using user.location)
   * cant be offline and have a location
   * change a user's location, then check user.location to makes sure the users's attribute updated
   * 
   * YASH
   * getFriends
   * querying a users's friends will show all their added friends (empty list)
   * querying a users's friends will show all their added friends ( list with friends)
   * add a friend to friendlist with mulitple friends in it, check that friendlist updates
   * querying a nonexistent user's friends will return error/wont work
   * 
   * 
   * deleteFriend
   * delete a friend from friendlist with mulitple friends in it, check that friendlist updates
   * do nothing to friendlist, make sure it stays the same with no changes
   *
   * WALEED
   * 
   * addFriend
   * adding an existing user to empty friendlist works
   * adding an existing user to non empty friendlist works
   * if you add the same friend to your list more than once it does not duplicate on the list
   * 
   * Deleting Users/friends
   * delete a user from DB, make sure they are deleted from all friendlists they are on
   * delete a friend from a users friendlist, make sure friendlist updates
   * delete an existing user from empty friendlist, check that nothing happens
*/

type TestUserData = {
  firstName: string;
  lastName: string;
  email: string;
  friends: string[];
  isOnline: boolean;
  location: string;
};

describe('TownsServiceAPIREST', () => {
  let server: http.Server;
  let apiClient: DatabaseServiceClient;

  beforeAll(async () => {
    const app = Express();
    app.use(CORS());
    server = http.createServer(app);

    addDBRoutes(server, app);
    await server.listen();
    const address = server.address() as AddressInfo;

    apiClient = new DatabaseServiceClient(`http://127.0.0.1:${address.port}`);
  });

  afterAll(async () => {
    await server.close();
  });
  describe('CoveyTownCreateAPI', () => {
    it('Allows for multiple users with the same first and last names as long as email is dif', async () => {
      const user1: TestUserData = {
        firstName: 'Kristen',
        lastName: 'Hyman',
        email: 'hyman.kristen@gmail.com',
        friends: ['hyman.jessica@gmail.com'],
        isOnline: true,
        location: 'Austin',
      };

      const user2: TestUserData = {
        firstName: 'Kristen',
        lastName: 'Hyman',
        email: 'kristenhyman1@gmail.com',
        friends: ['hyman.kristen@gmail.com'],
        isOnline: true,
        location: 'Boston',
      };
      await apiClient.addUser({ user: user1 });
      await apiClient.addUser({ user: user2 });

      expect(await apiClient.userExistence({ email: user1.email })).toBe(true);
      expect(await apiClient.userExistence({ email: user2.email })).toBe(true);
      
      // make sure to delete users after test
    });


    it('Prohibits a blank username/email', async () => {
      try {
        const user1: TestUserData = {
          firstName: 'Kristen',
          lastName: 'Hyman',
          email: '',
          friends: ['hyman.jessica@gmail.com'],
          isOnline: true,
          location: 'Austin',
        };

        await apiClient.addUser({ user: user1 });
        fail('addUser should throw an error if email is empty string');
      } catch (err) {
        // OK
      }
    });
  });

  describe('CoveyMemberAPI', () => {
    it('Throws an error if the added friend does not exist', async () => {
      const user1: TestUserData = {
        firstName: 'Kristen',
        lastName: 'Hyman',
        email: 'hyman.kristen@gmail.com',
        friends: ['hyman.jessica@gmail.com'],
        isOnline: true,
        location: 'Austin',
      };

      await apiClient.addUser({ user: user1 });
      console.log('recieving..',await apiClient.addFriend({ email: user1.email, friendEmail: 'nonexistent' }));
      expect(await apiClient.addFriend({ email: user1.email, friendEmail: 'nonexistent' })).toBe( {
        isOK: true,
        response: {},
        message:
          'friend not added: either they are not in the database or they are already in your lists.',
      });
    });
  });
});