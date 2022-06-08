import { Context, Contract, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import { userRepo } from '..';
import { User } from '../entity/user.entity';

export class UserContract extends Contract {
  constructor() {
    super('UserContract');
  }

  @Transaction()
  public async InitLedger(ctx: Context): Promise<void> {
    const assets: User[] = await userRepo.getAllUsers();

    for (const asset of assets) {
      await ctx.stub.putState(`USER${asset.id}`, Buffer.from(stringify(sortKeysRecursive(asset))));
    }
  }

  // GetAllAssets returns all assets found in the world state.
  @Transaction(false)
  @Returns('string')
  public async GetAllUsers(ctx: Context): Promise<string> {
    const allResults = [];
    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange('USER1', 'USER999');
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push(record);
      result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }

  // ReadAsset returns the asset stored in the world state with given id.
  @Transaction(false)
  public async ReadUser(ctx: Context, id: string): Promise<string> {
    const assetJSON = await ctx.stub.getState(`USER${id}`); // get the asset from chaincode state
    if (!assetJSON || assetJSON.length === 0) {
      throw new Error(`The asset ${id} does not exist`);
    }
    return assetJSON.toString();
  }

  // GetAllAssets returns all assets found in the world state.
  @Transaction(false)
  @Returns('string')
  public async Login(ctx: Context, dni: string, password: string): Promise<string> {
    const users = await this.GetAllUsers(ctx);
    const usersF = JSON.parse(users).filter((it) => it.dni === dni && it.password === password);
    if (!usersF.length) {
      throw new Error(`Usuario y/o contraseña incorrectos`);
    }

    const [user] = usersF;
    if (user.status === 'D') {
      throw new Error(`El usuario ha sido deshabilitado`);
    }
    return user;
  }

  // CreateAsset issues a new asset to the world state with given details.
  @Transaction()
  public async CreateUser(ctx: Context, dni: string, nombres: string, apellidos: string, correo: string, password: string, fechaNac: string, genero: string,
    direccion: string, numTelefonico: string, idRol: number, especialidad?: number): Promise<string> {
    const exists = await this.UserExists(ctx, dni);

    if (exists) {
      throw new Error(`El documento ${dni} ya se encuentra registrado`);
    }

    const user: User = {
      id: 0,
      dni,
      nombres,
      apellidos,
      correo,
      status: 'E',
      password,
      fechaNac,
      direccion,
      numTelefonico,
      genero,
      especialidad: !!especialidad ? especialidad : null,
      idRol,
    };

    try {
      const userId = await userRepo.saveUser(user);
      user.id = userId;
      await ctx.stub.putState(`USER${user.id}`, Buffer.from(stringify(sortKeysRecursive(user))));
      const resp = {
        id: user.id,
      };
      return JSON.stringify(resp);
    } catch (err) {
      throw new Error('Ocurrió un error registrando al usuario');
    }
  }

  // AssetExists returns true when asset with given ID exists in world state.
  @Transaction(false)
  @Returns('boolean')
  public async UserExists(ctx: Context, dni: string): Promise<boolean> {
    const users = await this.GetAllUsers(ctx);
    const usersF = JSON.parse(users).filter((it) => it.dni === dni);
    return !!usersF.length;
  }

  @Transaction(false)
  @Returns('boolean')
  public async Update(ctx: Context, id: number, dni: string, nombres: string, apellidos: string, correo: string, password: string, fechaNac: string, genero: string,
    direccion: string, numTelefonico: string, idRol: number, status: string, especialidad: number): Promise<boolean> {
    const userBefore = await this.getUserById(ctx, String(id));
    const user: User = {
      id,
      dni,
      nombres,
      apellidos,
      correo,
      password: userBefore.password,
      fechaNac,
      genero,
      direccion,
      especialidad,
      numTelefonico,
      idRol,
      status,
    };

    try {
      await userRepo.update(user);
      await ctx.stub.putState(`USER${id}`, Buffer.from(stringify(sortKeysRecursive(user))));
      return true;
    } catch (err) {
      throw new Error('Ocurrió un error actualizando al usuario');
    }
  }

  @Transaction(false)
  @Returns('boolean')
  public async UpdatePassword(ctx: Context, id: number, oldpassword: string, password: string): Promise<boolean> {
    const user = await this.getUserById(ctx, String(id));
    console.log(user.password, oldpassword);
    if (user.password != oldpassword) {
      throw new Error('Contraseña no coincide');
    }

    user.password = password;

    try {
      await userRepo.updatePassword(user);
      await ctx.stub.putState(`USER${id}`, Buffer.from(stringify(sortKeysRecursive(user))));
      return true;
    } catch (err) {
      throw new Error('Ocurrió un error actualizando el usuario');
    }
  }

  // AssetExists returns true when asset with given ID exists in world state.
  @Transaction(false)
  @Returns('boolean')
  public async Delete(ctx: Context, id: string): Promise<boolean> {
    try {
      await ctx.stub.deleteState(`USER${id}`);
      await userRepo.delete(id);
      return true;
    } catch (err) {
      throw new Error('Ocurrió un error actualizando el usuario');
    }
  }

  private async getUserById(ctx: Context, id: string): Promise<User> {
    const userD = await this.ReadUser(ctx, id);
    const user = JSON.parse(userD);
    console.log(user, user.password);
    return {
      apellidos: user.apellidos,
      correo: user.correo,
      direccion: user.direccion,
      dni: user.dni,
      fechaNac: user.fechaNac,
      genero: user.genero,
      id: user.id,
      idRol: user.idRol,
      nombres: user.nombres,
      numTelefonico: user.numTelefonico,
      password: user.password,
      status: user.status,
      especialidad: user.especialidad,
    };
  }
}
