import CORS from 'cors';
import Express from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import addDBRoutes from '../router/database';
import DatabaseServiceClient from './DatabasesServiceClient';



/**
   * Testing:
   *
   * Adding User to DB
   * adding a user to database with all appropriate parameters works
   * adding a user to database with empty username does not work
   * can NOT add a user with same email twice (ex: kristen hyman hyman.kristen@gmail.com and krissy hyman hyman.kristen@gmai.com)
   *
   * Adding Users to FriendList:
   * adding an existing user to empty friendlist works
   * adding an existing user to non empty friendlist works
   *
   * adding an nonexisting user to empty friendlist does not work
   * adding a nonexisting user to non empty friendlist does not work
   *
   * Signing online/offline
   * signing online changes a users status to true
   * signing offline changes a users status to offline
   * cant be offline and have a location
   * signing offline changes a users status to offline for people who have them as friends on their friendlists
   * signing online changes a users status to offline for people who have them as friends on their friendlists
   * 
   *
   * Querying friendlist
   * querying a users's friends will show all their added friends
   * add a friend to friendlist with mulitple friends in it, check that friendlist updates
   * delete a friend from friendlist with mulitple friends in it, check that friendlist updates
   * do nothing to friendlist, make sure it stays the same with no changes
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