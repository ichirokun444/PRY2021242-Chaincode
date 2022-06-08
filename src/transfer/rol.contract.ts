/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import { rolRepo } from '..';
import { Rol } from '../entity/rol.entity';

@Info({ title: 'RolContract', description: 'Smart contract for trading roles' })

export class RolContract extends Contract {
  constructor() {
    super('RolContract');
  }

  @Transaction()
  public async InitLedger(ctx: Context): Promise<void> {
    const assets: Rol[] = await rolRepo.getAllRoles();

    for (const asset of assets) {
      await ctx.stub.putState(`ROL${asset.id}`, Buffer.from(stringify(sortKeysRecursive(asset))));
    }
  }

  @Transaction(false)
  @Returns('string')
  public async GetAllRoles(ctx: Context): Promise<string> {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('ROL1', 'ROL999');
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
  public async ReadRol(ctx: Context, code: string): Promise<string> {
    const assetJSON = await ctx.stub.getState(`ROL${code}`); // get the asset from chaincode state
    if (!assetJSON || assetJSON.length === 0) {
      throw new Error(`The rol ${code} does not exist`);
    }
    return assetJSON.toString();
  }

  // CreateAsset issues a new asset to the world state with given details.
  @Transaction()
  public async CreateRol(ctx: Context, code: string, nombre: string): Promise<string> {
    const exists = await this.RolExists(ctx, String(code));
    if (exists) {
      throw new Error(`El rol ${code} ya se encuentra registrado`);
    }

    const rol: Rol = {
      id: 0,
      code,
      nombre,
    };

    try {
      const id = await rolRepo.saveRol(rol);
      rol.id = id;
      await ctx.stub.putState(`ROL${rol.id}`, Buffer.from(stringify(sortKeysRecursive(rol))));
      const resp = {
        id: rol.id,
      };
      return JSON.stringify(resp);
    } catch (err) {
      throw new Error(`Ocurrió un error registrando el rol`);
    }
  }

  @Transaction(false)
  @Returns('boolean')
  public async RolExists(ctx: Context, code: string): Promise<boolean> {
    const all = await this.GetAllRoles(ctx);
    const filtered = JSON.parse(all).filter((it) => it.code === code);
    return !!filtered.length;
  }

  @Transaction(false)
  @Returns('boolean')
  public async Update(ctx: Context, id: number, code: string, nombre: string): Promise<boolean> {
    const entity: Rol = {
      id,
      code,
      nombre,
    };

    try {
      await rolRepo.update(entity);
      await ctx.stub.putState(`ROL${id}`, Buffer.from(stringify(sortKeysRecursive(entity))));
      return true;
    } catch (err) {
      throw new Error(`Ocurrió un error actualizando el rol`);
    }
  }

  @Transaction(false)
  @Returns('boolean')
  public async Delete(ctx: Context, id: string): Promise<boolean> {
    try {
      await ctx.stub.deleteState(`ROL${id}`);
      await rolRepo.delete(id);
      return true;
    } catch (err) {
      throw new Error(`Ocurrió un error eliminando el rol`);
    }
  }
}
