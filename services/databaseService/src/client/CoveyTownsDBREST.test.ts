import CORS from 'cors';
import Express from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import addDBRoutes from '../router/database';
import DatabaseServiceClient from './DatabasesServiceClient';

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
      apiClient.deleteUser({ email: 'jabreakit.jubawdit@gmail.com' });
      apiClient.deleteUser({ email: 'whodis@gmail.com' });
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

  describe('CoveyFriendsAPI', () => {
    it('adding an existing user to empty friendlist works', async () => {
      const user1: TestUserData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@gmail.com',
        friends: [],
        isOnline: true,
        location: 'Lobby',
      };

      const user2: TestUserData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'janedoe@gmail.com',
        friends: [],
        isOnline: true,
        location: 'Lobby',
      };

      await apiClient.addUser({ user: user1 });
      await apiClient.addUser({ user: user2 });
      await apiClient.addFriend({ email: user1.email, friendEmail: user2.email });
      const addFriendResult = await apiClient.getFriends({ email: user1.email });
      expect(addFriendResult).toContainEqual({
        email: user2.email,
        isOnline: user2.isOnline,
        location: user2.location,
      });
      await apiClient.deleteUser({ email: user1.email });
      await apiClient.deleteUser({ email: user2.email });
    });
    it('adding an existing user to a non-empty friendlist works', async () => {
      const user1: TestUserData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@gmail.com',
        friends: [],
        isOnline: true,
        location: 'Lobby',
      };

      const user2: TestUserData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'janedoe@gmail.com',
        friends: [],
        isOnline: true,
        location: 'Lobby',
      };

      const user3: TestUserData = {
        firstName: 'Lewis',
        lastName: 'Hamilton',
        email: 'lewishamilton@gmail.com',
        friends: [],
        isOnline: true,
        location: 'Lobby',
      };

      await apiClient.addUser({ user: user1 });
      await apiClient.addUser({ user: user2 });
      await apiClient.addUser({ user: user3 });
      await apiClient.addFriend({ email: user1.email, friendEmail: user2.email });
      await apiClient.addFriend({ email: user1.email, friendEmail: user3.email });

      const addFriendResult = await apiClient.getFriends({ email: user1.email });
      expect(addFriendResult).toContainEqual({
        email: user3.email,
        isOnline: user3.isOnline,
        location: user3.location,
      });
      await apiClient.deleteUser({ email: user1.email });
      await apiClient.deleteUser({ email: user2.email });
      await apiClient.deleteUser({ email: user3.email });
    });
    it('if you add the same friend to your list more than once it does not duplicate on the list', async () => {
      const user1: TestUserData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@gmail.com',
        friends: [],
        isOnline: true,
        location: 'Lobby',
      };

      const user2: TestUserData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'janedoe@gmail.com',
        friends: [],
        isOnline: true,
        location: 'Lobby',
      };

      await apiClient.addUser({ user: user1 });
      await apiClient.addUser({ user: user2 });
      await apiClient.addFriend({ email: user1.email, friendEmail: user2.email });
      const addFriendResult = await apiClient.getFriends({ email: user1.email });
      const sizeAfterOneAdd = addFriendResult.length;

      await apiClient.addFriend({ email: user1.email, friendEmail: user2.email });
      const addFriendAgainResult = await apiClient.getFriends({ email: user1.email });
      const sizeAfterSecondAdd = addFriendAgainResult.length;

      expect(sizeAfterOneAdd).toEqual(sizeAfterSecondAdd);

      await apiClient.deleteUser({ email: user1.email });
      await apiClient.deleteUser({ email: user2.email });
    });
    it('delete a friend from a users friendlist, make sure friendlist updates', async () => {
      const user1: TestUserData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@gmail.com',
        friends: [],
        isOnline: true,
        location: 'Lobby',
      };

      const user2: TestUserData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'janedoe@gmail.com',
        friends: [],
        isOnline: true,
        location: 'Lobby',
      };

      await apiClient.addUser({ user: user1 });
      await apiClient.addUser({ user: user2 });
      await apiClient.addFriend({ email: user1.email, friendEmail: user2.email });
      await apiClient.deleteFriend({ email: user1.email, friendEmail: user2.email });
      const friendsListAfterDelete = await apiClient.getFriends({ email: user1.email });

      expect(friendsListAfterDelete).not.toContainEqual({
        email: user2.email,
        isOnline: user2.isOnline,
        location: user2.location,
      });

      await apiClient.deleteUser({ email: user1.email });
      await apiClient.deleteUser({ email: user2.email });
    });
    it('delete an existing user from empty friendlist, check that nothing happens', async () => {
      const user1: TestUserData = {
        firstName: 'Friendless',
        lastName: 'User',
        email: 'friendlessuser@gmail.com',
        friends: [],
        isOnline: true,
        location: 'Lobby',
      };

      const user2: TestUserData = {
        firstName: 'Lonely',
        lastName: 'Boi',
        email: 'lonelyboi@gmail.com',
        friends: [],
        isOnline: true,
        location: 'Lobby',
      };

      await apiClient.addUser({ user: user1 });
      await apiClient.addUser({ user: user2 });
      await apiClient.deleteFriend({ email: user1.email, friendEmail: user2.email });
      const addFriendResult = await apiClient.getFriends({ email: user1.email });
      const sizeAfterDelete = addFriendResult.length;

      expect(sizeAfterDelete).toEqual(0);
      await apiClient.deleteUser({ email: user1.email });
      await apiClient.deleteUser({ email: user2.email });
    });
    it('delete a user from DB, make sure they are deleted from all friendlists they are on', async () => {
      const user1: TestUserData = {
        firstName: 'Will',
        lastName: 'Delete',
        email: 'willdelete@gmail.com',
        friends: [],
        isOnline: true,
        location: 'Lobby',
      };

      const user2: TestUserData = {
        firstName: 'Lonely',
        lastName: 'Boi2',
        email: 'lonelyboi2@gmail.com',
        friends: [],
        isOnline: true,
        location: 'Lobby',
      };

      await apiClient.addUser({ user: user1 });
      await apiClient.addUser({ user: user2 });
      await apiClient.addFriend({ email: user1.email, friendEmail: user2.email });
      await apiClient.deleteUser({ email: user2.email });
      const addFriendResult = await apiClient.getFriends({ email: user1.email });
      const sizeAfterDelete1 = addFriendResult.length;
      expect(sizeAfterDelete1).toEqual(0);

      await apiClient.deleteUser({ email: user1.email });
      await apiClient.deleteUser({ email: user2.email });
    });
  });
});
