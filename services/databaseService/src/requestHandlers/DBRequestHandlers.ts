import { MongoClient } from 'mongodb';

const DB_NAME = 'coveyTown';

const COLLECTION_NAME = 'users';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  friends: string[];
  isOnline: boolean;
}

export interface UserInfo {
  email: string;
  isOnline: boolean;
  location: string;
}

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

export interface AddUserRequest {
  user: User;
}

export interface UserEmailRequest {
  email: string;
}

export interface StatusChangeRequest {
  email: string;
  isOnline: boolean;
}

export interface LocationChangeRequest {
  email: string;
  location: string;
}

export interface AddFriendRequest {
  email: string;
  friendEmail: string;
}

export interface RemoveFriendRequest {
  email: string;
  friendEmail: string;
}

export default class MongoClientFactory {
  // private uri = process.env.REACT_APP_MONGODB_URI || '';
  private uri =
    'mongodb+srv://dbUser:dbUserPassword@cluster0.rdokz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

  private static _instance: MongoClientFactory;

  static getInstance(): MongoClientFactory {
    if (MongoClientFactory._instance === undefined) {
      MongoClientFactory._instance = new MongoClientFactory();
    }
    return MongoClientFactory._instance;
  }

  public async getMongoClient(): Promise<MongoClient> {
    const client: MongoClient = new MongoClient(this.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    return client;
  }
}

export async function userExistsHandler(
  requestData: UserEmailRequest,
): Promise<ResponseEnvelope<boolean>> {
  const client: MongoClient = await MongoClientFactory.getInstance().getMongoClient();
  const userEmails = await client.db(DB_NAME).collection(COLLECTION_NAME).distinct('email');
  client.close();
  const result = userEmails.includes(requestData.email);
  return {
    isOK: true,
    response: result,
  };
}

export async function getFriendsHandler(
  requestData: UserEmailRequest,
): Promise<ResponseEnvelope<UserInfo[]>> {
  const client: MongoClient = await MongoClientFactory.getInstance().getMongoClient();
  const user = await client
    .db(DB_NAME)
    .collection(COLLECTION_NAME)
    .findOne({ email: requestData.email });
  const { friends } = user;
  const friendStatuses: UserInfo[] = await client
    .db(DB_NAME)
    .collection(COLLECTION_NAME)
    .find({ email: { $in: friends } })
    .project({ email: 1, isOnline: 1, location: 1, _id: 0 })
    .toArray();
  client.close();
  return {
    isOK: true,
    response: friendStatuses,
  };
}

export async function getAllUsersHandler(): Promise<ResponseEnvelope<string[]>> {
  const client: MongoClient = await MongoClientFactory.getInstance().getMongoClient();
  const userEmails = await client.db(DB_NAME).collection(COLLECTION_NAME).distinct('email');
  client.close();
  return {
    isOK: true,
    response: userEmails,
  };
}
export async function getStatusHandler(
  requestData: UserEmailRequest,
): Promise<ResponseEnvelope<boolean>> {
  const client: MongoClient = await MongoClientFactory.getInstance().getMongoClient();
  const user = await client
    .db(DB_NAME)
    .collection(COLLECTION_NAME)
    .findOne({ email: requestData.email });
  client.close();
  return {
    isOK: true,
    response: user.isOnline,
  };
}

export async function setStatusHandler(
  requestData: StatusChangeRequest,
): Promise<ResponseEnvelope<Record<string, null>>> {
  const client: MongoClient = await MongoClientFactory.getInstance().getMongoClient();
  await client
    .db(DB_NAME)
    .collection(COLLECTION_NAME)
    .updateOne({ email: requestData.email }, { $set: { isOnline: requestData.isOnline } });
  client.close();
  return {
    isOK: true,
    message: 'status changed',
  };
}

export async function setLocationHandler(
  requestData: LocationChangeRequest,
): Promise<ResponseEnvelope<Record<string, null>>> {
  const client: MongoClient = await MongoClientFactory.getInstance().getMongoClient();
  await client
    .db(DB_NAME)
    .collection(COLLECTION_NAME)
    .updateOne({ email: requestData.email }, { $set: { location: requestData.location } });
  client.close();
  return {
    isOK: true,
    message: 'location changed',
  };
}

export async function addFriendHandler(
  requestData: AddFriendRequest,
): Promise<ResponseEnvelope<Record<string, null>>> {
  const client: MongoClient = await MongoClientFactory.getInstance().getMongoClient();
  const user = await client
    .db(DB_NAME)
    .collection(COLLECTION_NAME)
    .findOne({ email: requestData.email });
  const { friends } = user;
  // check if the person with this email-id exists in the database
  const userEmails = await client.db(DB_NAME).collection(COLLECTION_NAME).distinct('email');
  const friendExists = userEmails.includes(requestData.friendEmail);

  // check if the friend has already been added
  const shouldInsert =
    !friends.includes(requestData.friendEmail) &&
    friendExists &&
    requestData.friendEmail !== requestData.email;
  if (shouldInsert) {
    await client
      .db(DB_NAME)
      .collection(COLLECTION_NAME)
      .updateOne({ email: requestData.email }, { $push: { friends: requestData.friendEmail } });
    client.close();
    return {
      isOK: true,
      response: {},
      message: 'friend added to your list',
    };
  }
  client.close();
  return {
    isOK: true,
    response: {},
    message:
      'friend not added: either they are not in the database or they are already in your lists.',
  };
}

export async function addUserHandler(
  requestData: AddUserRequest,
): Promise<ResponseEnvelope<Record<string, null>>> {
  const client: MongoClient = await MongoClientFactory.getInstance().getMongoClient();
  const userEmails = await client.db(DB_NAME).collection(COLLECTION_NAME).distinct('email');
  const shouldInsert = !userEmails.includes(requestData.user.email);
  if (shouldInsert) {
    await client.db(DB_NAME).collection(COLLECTION_NAME).insertOne(requestData.user);
    client.close();
    return {
      isOK: true,
      message: 'Added user',
    };
  }
  client.close();
  return {
    isOK: true,
    message: 'user was not added',
  };
}

export async function deleteUser(
  requestData: UserEmailRequest,
): Promise<ResponseEnvelope<Record<string, null>>> {
  const client: MongoClient = await MongoClientFactory.getInstance().getMongoClient();
  await client.db(DB_NAME).collection(COLLECTION_NAME).deleteOne({ email: requestData.email });
  client.close();
  return {
    isOK: true,
    message: 'User deleted',
  };
}

export async function removeFriendHandler(
  requestData: RemoveFriendRequest,
): Promise<ResponseEnvelope<Record<string, null>>> {
  const client: MongoClient = await MongoClientFactory.getInstance().getMongoClient();
  await client
    .db(DB_NAME)
    .collection(COLLECTION_NAME)
    .updateOne({ email: requestData.email }, { $pull: { friends: requestData.friendEmail } });
  client.close();
  return {
    isOK: true,
    message: 'friend removed',
  };
}
