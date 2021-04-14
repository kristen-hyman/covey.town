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


  describe('CoveyTownStatusAPI', () => {
    it('Signing online changes a user\'s status to true', async () => {
      // First time user
      const loginUser: TestUserData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'doe.j@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };
      await apiClient.addUser({ user: loginUser }); // adds a new entry to db and sets user online
      expect(await apiClient.getOnlineStatus({ email: loginUser.email })).toBe(true); // checks that user is online

      // Returning user
      await apiClient.setOnlineStatus({ email: loginUser.email, isOnline: false }); // user going offline
      expect(await apiClient.getOnlineStatus({ email: loginUser.email })).toBe(false); // checks that user is offline
      await apiClient.setOnlineStatus({ email: loginUser.email, isOnline: true }); // user going back online
      expect(await apiClient.getOnlineStatus({ email: loginUser.email })).toBe(true); // checks that user is online

      await apiClient.deleteUser({ email: loginUser.email }); // delete user after test
    });

    it('Signing offline changes a user\'s status to false', async () => {
      // First time user
      const loginUser: TestUserData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'doe.j@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };
      await apiClient.addUser({ user: loginUser }); // adds a new entry to db and sets user online
      expect(await apiClient.getOnlineStatus({ email: loginUser.email })).toBe(true); // checks that user is online
      await apiClient.setOnlineStatus({ email: loginUser.email, isOnline: false }); // user going offline
      expect(await apiClient.getOnlineStatus({ email: loginUser.email })).toBe(false); // checks that user is offline

      // Returning user
      await apiClient.setOnlineStatus({ email: loginUser.email, isOnline: true }); // user going online
      expect(await apiClient.getOnlineStatus({ email: loginUser.email })).toBe(true); // checks that user is online
      await apiClient.setOnlineStatus({ email: loginUser.email, isOnline: false }); // user going back offline
      expect(await apiClient.getOnlineStatus({ email: loginUser.email })).toBe(false); // checks that user is offline

      await apiClient.deleteUser({ email: loginUser.email }); // delete user after test
    });

    it('Signing online changes a user\'s status to online in the friend list of other users', async () => {
    
    });

    it('Signing offline changes a user\'s status to offline in the friend list of other users', async () => {
    
    });
  });





  // describe('CoveyTownCreateAPI', () => {
  //   it('Allows for multiple users with the same first and last names as long as email is dif', async () => {
  //     const user1: TestUserData = {
  //       firstName: 'Kristen',
  //       lastName: 'Hyman',
  //       email: 'hyman.kristen@gmail.com',
  //       friends: ['hyman.jessica@gmail.com'],
  //       isOnline: true,
  //       location: 'Austin',
  //     };

  //     const user2: TestUserData = {
  //       firstName: 'Kristen',
  //       lastName: 'Hyman',
  //       email: 'kristenhyman1@gmail.com',
  //       friends: ['hyman.kristen@gmail.com'],
  //       isOnline: true,
  //       location: 'Boston',
  //     };
  //     await apiClient.addUser({ user: user1 });
  //     await apiClient.addUser({ user: user2 });

  //     expect(await apiClient.userExistence({ email: user1.email })).toBe(true);
  //     expect(await apiClient.userExistence({ email: user2.email })).toBe(true);
      
  //     // make sure to delete users after test
  //   });


  //   it('Prohibits a blank username/email', async () => {
  //     try {
  //       const user1: TestUserData = {
  //         firstName: 'Kristen',
  //         lastName: 'Hyman',
  //         email: '',
  //         friends: ['hyman.jessica@gmail.com'],
  //         isOnline: true,
  //         location: 'Austin',
  //       };

  //       await apiClient.addUser({ user: user1 });
  //       fail('addUser should throw an error if email is empty string');
  //     } catch (err) {
  //       // OK
  //     }
  //   });
  // });

  // describe('CoveyMemberAPI', () => {
  //   it('Throws an error if the added friend does not exist', async () => {
  //     const user1: TestUserData = {
  //       firstName: 'Kristen',
  //       lastName: 'Hyman',
  //       email: 'hyman.kristen@gmail.com',
  //       friends: ['hyman.jessica@gmail.com'],
  //       isOnline: true,
  //       location: 'Austin',
  //     };

  //     await apiClient.addUser({ user: user1 });
  //     // console.log('recieving..',await apiClient.addFriend({ email: user1.email, friendEmail: 'nonexistent' }));
  //     expect(await apiClient.addFriend({ email: user1.email, friendEmail: 'nonexistent' })).toBe( {
  //       isOK: true,
  //       response: {},
  //       message:
  //         'friend not added: either they are not in the database or they are already in your lists.',
  //     });
  //   });
  // });
});