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


  describe('DatabaseServiceOnlineStatusAPI', () => {
    it('Read the correct online status of a user I', async () => {
      const user1: TestUserData = {
        firstName: 'Michael',
        lastName: 'Jordan',
        email: 'michaeljordan@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };

      await apiClient.addUser({ user: user1 });
      expect(await apiClient.getOnlineStatus({ email: user1.email })).toBe(true);
      await apiClient.deleteUser({ email: user1.email });
    });

    it('Read the correct offline status of a user II', async () => {
      const user2: TestUserData = {
        firstName: 'Lebron',
        lastName: 'James',
        email: 'lebronjames@gmail.com',
        friends: [],
        isOnline: false,
        location: '',
      };

      await apiClient.addUser({ user: user2 });
      expect(await apiClient.getOnlineStatus({ email: user2.email })).toBe(false);
      await apiClient.deleteUser({ email: user2.email });
    });

    it('Read the most updated status of a user I', async () => {
      const user1: TestUserData = {
        firstName: 'Michael',
        lastName: 'Jordan',
        email: 'michaeljordan@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };
  
      user1.isOnline = false;
      await apiClient.addUser({ user: user1 });
      expect(await apiClient.getOnlineStatus({ email: user1.email })).toBe(false);
      await apiClient.deleteUser({ email: user1.email });
    });

    it('Read the most updated status of a user II', async () => {
      const user2: TestUserData = {
        firstName: 'Lebron',
        lastName: 'James',
        email: 'lebronjames@gmail.com',
        friends: [],
        isOnline: false,
        location: '',
      };

      user2.isOnline = true;
      await apiClient.addUser({ user: user2 });
      expect(await apiClient.getOnlineStatus({ email: user2.email })).toBe(true);
      await apiClient.deleteUser({ email: user2.email });
    });


    it('Setting an online status when a user is online makes no changes', async () => {
      const user1: TestUserData = {
        firstName: 'Michael',
        lastName: 'Jordan',
        email: 'michaeljordan@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };

      await apiClient.addUser({ user: user1 });
      await apiClient.setOnlineStatus({ email: user1.email, isOnline: true });
      expect(await apiClient.getOnlineStatus({ email: user1.email })).toBe(true);
      await apiClient.deleteUser({ email: user1.email });
    });

    it('Setting an offline status when a user is offline makes no changes', async () => {
      const user2: TestUserData = {
        firstName: 'Lebron',
        lastName: 'James',
        email: 'lebronjames@gmail.com',
        friends: [],
        isOnline: false,
        location: '',
      };

      await apiClient.addUser({ user: user2 });
      await apiClient.setOnlineStatus({ email: user2.email, isOnline: false });
      expect(await apiClient.getOnlineStatus({ email: user2.email })).toBe(false);
      await apiClient.deleteUser({ email: user2.email });
    });

    it('Read the correct status of users after a change I', async () => {
      const user1: TestUserData = {
        firstName: 'Michael',
        lastName: 'Jordan',
        email: 'michaeljordan@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };

      await apiClient.addUser({ user: user1 });
      await apiClient.setOnlineStatus({ email: user1.email, isOnline: false });
      expect(await apiClient.getOnlineStatus({ email: user1.email })).toBe(false);
      await apiClient.deleteUser({ email: user1.email });
    });

    it('Read the correct status of users after a change II', async () => {
      const user2: TestUserData = {
        firstName: 'Lebron',
        lastName: 'James',
        email: 'lebronjames@gmail.com',
        friends: [],
        isOnline: false,
        location: '',
      };

      await apiClient.addUser({ user: user2 });
      await apiClient.setOnlineStatus({ email: user2.email, isOnline: true });
      expect(await apiClient.getOnlineStatus({ email: user2.email })).toBe(true);
      await apiClient.deleteUser({ email: user2.email });
    });
  });



  describe('DatabaseServiceUserLocationAPI', () => {
    it('See location when user signs in', async () => {
      const newUser: TestUserData = {
        firstName: 'Kobe',
        lastName: 'Bryant',
        email: 'kobebryant@gmail.com',
        friends: [],
        isOnline: true,
        location: 'Lobby',
      };

      await apiClient.addUser({ user: newUser }); 
      expect(newUser.location).toBe('Lobby');
      await apiClient.deleteUser({ email: newUser.email }); 
    });

    it('See most updated location when user signs in', async () => {
      const newUser: TestUserData = {
        firstName: 'Kobe',
        lastName: 'Bryant',
        email: 'kobebryant@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };

      newUser.location = 'Lobby'; 
      await apiClient.addUser({ user: newUser }); 
      expect(newUser.location).toBe('Lobby');
      await apiClient.deleteUser({ email: newUser.email }); 
    });

    it('Location update works when user is login', async () => {
      const newUser: TestUserData = {
        firstName: 'Kobe',
        lastName: 'Bryant',
        email: 'kobebryant@gmail.com',
        friends: [],
        isOnline: true,
        location: '',
      };

      await apiClient.addUser({ user: newUser }); 
      await apiClient.setUserLocation({ email: newUser.email, location: 'EAC9273X' });
      expect(await apiClient.getUserLocation({ email: newUser.email })).toBe('EAC9273X');
      await apiClient.deleteUser({ email: newUser.email });
    });




  });
});