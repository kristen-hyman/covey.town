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

export interface TestUserInfo {
  email: string;
  isOnline: boolean;
  location: string;
}

describe('DatabaseServiceTest', () => {
  let server: http.Server;
  let apiClient: DatabaseServiceClient;

  beforeAll(async () => {
    const app = Express();
    app.use(CORS());
    server = http.createServer(app);

    addDBRoutes(server, app);
    server.listen();
    const address = server.address() as AddressInfo;

    apiClient = new DatabaseServiceClient(`http://127.0.0.1:${address.port}`);
  });

  afterAll(async () => {
    server.close();
  });
  describe('DatabaseServiceGetFriendsAPI', () => {
    it('gets an empty list if the user has been just created and/or has no friends yet', async () => {
      const user1: TestUserData = {
        firstName: 'Whodis',
        lastName: 'Whodis',
        email: 'whodis1@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };

      await apiClient.addUser({ user: user1 });

      expect(await apiClient.getFriends({ email: 'whodis1@gmail.com' })).toStrictEqual([]);
      await apiClient.deleteUser({ email: 'whodis1@gmail.com' });
    });

    it('gets a list of friends if the user has friends', async () => {
      const user1: TestUserData = {
        firstName: 'Whodis',
        lastName: 'Whodis',
        email: 'whodis@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };
      const user2: TestUserData = {
        firstName: 'jabreakit',
        lastName: 'jubawdit',
        email: 'jabreakit.jubawdit@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };
      const user3: TestUserData = {
        firstName: 'jabreakit',
        lastName: 'jubawdit2',
        email: 'jabreakit.jubawdit2@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };
      await apiClient.addUser({ user: user1 });
      await apiClient.addUser({ user: user2 });
      await apiClient.addUser({ user: user3 });
      await apiClient.addFriend({
        email: 'whodis@gmail.com',
        friendEmail: 'jabreakit.jubawdit@gmail.com',
      });
      let friends: TestUserInfo[] = await apiClient.getFriends({ email: 'whodis@gmail.com' });
      expect(friends).toContainEqual({
        email: 'jabreakit.jubawdit@gmail.com',
        isOnline: true,
        location: '',
      });

      await apiClient.addFriend({
        email: 'whodis@gmail.com',
        friendEmail: 'jabreakit.jubawdit2@gmail.com',
      });

      friends = await apiClient.getFriends({ email: 'whodis@gmail.com' });
      expect(friends).toContainEqual({
        email: 'jabreakit.jubawdit@gmail.com',
        isOnline: true,
        location: '',
      });
      expect(friends).toContainEqual({
        email: 'jabreakit.jubawdit2@gmail.com',
        isOnline: true,
        location: '',
      });

      apiClient.deleteUser({ email: 'whodis@gmail.com' });
      apiClient.deleteUser({ email: 'jabreakit.jubawdit2@gmail.com' });
      apiClient.deleteUser({ email: 'jabreakit.jubawdit@gmail.com' });
    });

    it('throws an error when getting friends for a user that does not exist.', async () => {
      await expect(apiClient.getFriends({ email: 'someonenotonthedatabase' })).rejects.toThrowError(
        'Error processing request: User with that email does not exist',
      );
    });
  });

  describe('DatabaseServiceDeleteFriendsAPI', () => {
    it('deletes a friend from a users friend list', async () => {
      const user1: TestUserData = {
        firstName: 'Whodis',
        lastName: 'Whodis',
        email: 'whodis@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };
      const user2: TestUserData = {
        firstName: 'jabreakit',
        lastName: 'jubawdit',
        email: 'jabreakit.jubawdit@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };
      await apiClient.addUser({ user: user1 });
      await apiClient.addUser({ user: user2 });
      await apiClient.addFriend({
        email: 'whodis@gmail.com',
        friendEmail: 'jabreakit.jubawdit@gmail.com',
      });

      let friends: TestUserInfo[] = await apiClient.getFriends({ email: 'whodis@gmail.com' });
      expect(friends).toContainEqual({
        email: 'jabreakit.jubawdit@gmail.com',
        isOnline: true,
        location: '',
      });

      await apiClient.deleteFriend({
        email: 'whodis@gmail.com',
        friendEmail: 'jabreakit.jubawdit@gmail.com',
      });
      friends = await apiClient.getFriends({ email: 'whodis@gmail.com' });

      expect(friends.length).toBe(0);
    });
  });

  describe('DatabaseServiceAddUserAPI', () => {
    it('adding a user to database with all appropriate parameters works', async () => {
      const user1: TestUserData = {
        firstName: 'Scarlett',
        lastName: 'Silverstein',
        email: 'scarlett@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };

      await apiClient.addUser({ user: user1 });

      expect(await apiClient.userExistence({ email: 'scarlett@gmail.com' })).toBe(true);

      expect(user1.firstName).toEqual('Scarlett');
      expect(user1.lastName).toEqual('Silverstein');
      expect(user1.email).toEqual('scarlett@gmail.com');
      expect(user1.friends).toEqual([]);
      expect(user1.isOnline).toEqual(true);
      expect(user1.location).toEqual('');

      await apiClient.deleteUser({ email: 'scarlett@gmail.com' });
    });

    it('allows for multiple users with the same first and last names as long as email is dif', async () => {
      const user1: TestUserData = {
        firstName: 'Scarlett',
        lastName: 'Silverstein',
        email: 'scarlettEmail1@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };
      const user2: TestUserData = {
        firstName: 'Scarlett',
        lastName: 'Silverstein',
        email: 'scarlettEmail2@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };
      await apiClient.addUser({ user: user1 });
      await apiClient.addUser({ user: user2 });

      expect(await apiClient.userExistence({ email: 'scarlettEmail1@gmail.com' })).toBe(true);
      expect(await apiClient.userExistence({ email: 'scarlettEmail2@gmail.com' })).toBe(true);

      await apiClient.deleteUser({ email: 'scarlettEmail1@gmail.com' });
      await apiClient.deleteUser({ email: 'scarlettEmail2@gmail.com' });
    });
  });
  describe('DatabaseServiceUserExistenceAPI', () => {
    it('adding a nonexisting user to empty friendlist does not work', async () => {
      const user1: TestUserData = {
        firstName: 'Scarlett',
        lastName: 'Silverstein',
        email: 'scarlett@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };

      await apiClient.addUser({ user: user1 });

      await apiClient.addFriend({
        email: 'scarlett@gmail.com',
        friendEmail: 'fakeEmailForTesting',
      });

      expect(user1.friends.length).toBe(0);
      expect(user1.friends).not.toContain('fakeEmailForTesting');

      await apiClient.deleteUser({ email: 'scarlett@gmail.com' });
    });

    it('adding a nonexisting user to non empty friendlist does not work', async () => {
      const user1: TestUserData = {
        firstName: 'Scarlett',
        lastName: 'Silverstein',
        email: 'scarlett@gmail.com',
        friends: ['onefriend@gmail.com'],
        isOnline: true,
        location: '',
      };

      await apiClient.addUser({ user: user1 });
      await apiClient.addFriend({
        email: 'scarlett@gmail.com',
        friendEmail: 'fakeEmailForTesting',
      });

      expect(user1.friends.length).toBe(1);
      expect(user1.friends).not.toContain('fakeEmailForTesting');

      await apiClient.deleteUser({ email: 'scarlett@gmail.com' });
    });

    it('user that is not in database when queried w/ userExistence should return false', async () => {
      expect(await apiClient.userExistence({ email: 'fakeEmailNotInDB@gmail.com' })).toBe(false);
    });

    it('after deletion, userExistence for deleted user should return false', async () => {
      const user1: TestUserData = {
        firstName: 'Sprout',
        lastName: 'Silverstein',
        email: 'dogsrock@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };

      await apiClient.addUser({ user: user1 });
      expect(await apiClient.userExistence({ email: 'dogsrock@gmail.com' })).toBe(true);

      await apiClient.deleteUser({ email: 'dogsrock@gmail.com' });
      expect(await apiClient.userExistence({ email: 'dogsrock@gmail.com' })).toBe(false);
    });

    it('after adding, userExistence should return true', async () => {
      const user1: TestUserData = {
        firstName: 'Sprout',
        lastName: 'Silverstein',
        email: 'dogsrock@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };

      await apiClient.addUser({ user: user1 });
      expect(await apiClient.userExistence({ email: 'dogsrock@gmail.com' })).toBe(true);
      await apiClient.deleteUser({ email: 'dogsrock@gmail.com' });
    });
  });
});
