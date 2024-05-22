const MongoLib = require('../lib/mongo');

class UsersService {
  constructor() {
    this.collection = 'ndtl_users';
    this.mongoDB = new MongoLib();
  }

  async getUser({ email }) {
    const [user] = await this.mongoDB.getAll(this.collection, { email });
    return user;
  }

  async getUserByConfirmationToken({ confirmation_token }) {
    const [user] = await this.mongoDB.getAll(this.collection, {
      confirmation_token
    });
    return user;
  }

  async confirmUserAccount({ userId, user } = {}) {
    const userConfirmedId = await this.mongoDB.update(
      this.collection,
      userId,
      user
    );
    return userConfirmedId;
  }

  async updateUserInformation({ userId, user } = {}) {
    const userUpdatedId = await this.mongoDB.update(
      this.collection,
      userId,
      user
    );
    return userUpdatedId;
  }

  async createUser({ user }) {
    const {
      user_name,
      email,
      type_user,
      scope_type_id,
      confirmation_token,
      confirmed,
      enabled,
      assigned,
      created_by,
      created_at,
      updated_at,
    } = user;

    const createUserId = await this.mongoDB.create(this.collection, {
      user_name,
      email,
      type_user,
      scope_type_id,
      confirmation_token,
      confirmed,
      enabled,
      assigned,
      created_by,
      created_at,
      updated_at,
    });

    return createUserId;
  }

  async getOrCreateUser({ user }) {
    const queriedUser = await this.getUser({ email: user.email });

    if (queriedUser) {
      return queriedUser;
    }

    await this.createUser({ user });
    return await this.getUser({ email: user.email });
  }

  async getUserById({ userId }) {
    const user = await this.mongoDB.get(this.collection, userId);
    return user || {};
  }

  async getUserByPasswordResetToken({ password_reset_token }) {
    const [user] = await this.mongoDB.getAll(this.collection, {
      password_reset_token
    });
    return user;
  }

  async getUsersBasedOnCreatedBy({ created_by }) {
    const users = await this.mongoDB.getAll(this.collection, { created_by });
    return users || [];
  }

  async getUsersBasedOn({ assigned }) {
    const users = await this.mongoDB.getAll(this.collection, { assigned });
    return users || [];
  }

  async getUsersAssignedCommerce({ assigned_commerce }) {
    const users = await this.mongoDB.getAll(this.collection, {
      assigned_commerce,
      type_user: 'owner'
    });
    return users || [];
  }

  async getAllOwnerAssigned({ assigned_commerce }) {
    const users = await this.mongoDB.getAll(this.collection, {
      assigned_commerce,
      type_user: 'owner',
      enabled: true
    });
    return users || [];
  }

  async getUsersActives() {
    const users = await this.mongoDB.getAll(this.collection, {
      enabled: true,
      type_user: 'owner'
    });
    return users || [];
  }

  async getUsersAll() {
    const users = await this.mongoDB.getAll(this.collection, {});
    return users || [];
  }

  async delteUser({ userId }) {
    const deletedUserId = await this.mongoDB.deleteOne(this.collection, userId);
    return deletedUserId || {};
  }

  async getAllUserType({ type_user }) {
    const users = await this.mongoDB.getAll(this.collection, { type_user });
    return users || [];
  }

  async getUsersAssignedBaseOnCreatedBy({ created_by }) {
    const users = await this.mongoDB.getAll(this.collection, {
      created_by,
      assigned_commerce: false,
      type_user: 'owner'
    });
    return users || [];
  }

  async getBasedOnQuery(query) {
    const users = await this.mongoDB.getAll(this.collection, query);
    return users;
  }
  async getUsersBaseOnCreatedByAndTypeUser({ created_by, type_user }) {
    const users = await this.mongoDB.getAll(this.collection, {
      created_by,
      type_user
    });
    return users || [];
  }
}

module.exports = UsersService;
