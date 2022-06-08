/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import { centerRepo } from '..';
import { Center } from '../entity/center.entity';

@Info({ title: 'CenterContract', description: 'Smart contract for trading centers' })

export class CenterContract extends Contract {
  constructor() {
    super('CenterContract');
  }

  @Transaction()
  public async InitLedger(ctx: Context): Promise<void> {
    const assets: Center[] = await centerRepo.getAllCenters();

    for (const asset of assets) {
      await ctx.stub.putState(`CENTER${asset.id}`, Buffer.from(stringify(sortKeysRecursive(asset))));
    }
  }

  @Transaction(false)
  @Returns('string')
  public async GetAllCenters(ctx: Context): Promise<string> {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('CENTER1', 'CENTER999');
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
  public async ReadCenter(ctx: Context, id: string): Promise<string> {
    const assetJSON = await ctx.stub.getState(`CENTER${id}`); // get the asset from chaincode state
    if (!assetJSON || assetJSON.length === 0) {
      throw new Error(`The center ${id} does not exist`);
    }
    return assetJSON.toString();
  }

  // CreateAsset issues a new asset to the world state with given details.
  @Transaction()
  public async CreateCenter(ctx: Context, code: string, nombre: string): Promise<string> {
    const exists = await this.CenterExists(ctx, code);
    if (exists) {
      throw new Error(`El centro de salud ${code} ya se encuentra registrado`);
    }

    const center: Center = {
      id: 0,
      code,
      nombre,
    };

    try {
      const id = await centerRepo.saveCenter(center);
      center.id = id;
      await ctx.stub.putState(`CENTER${center.id}`, Buffer.from(stringify(sortKeysRecursive(center))));
      const resp = {
        id: center.id,
      };
      return JSON.stringify(resp);
    } catch (err) {
      throw new Error(`Ocurrió un error registrando el centro`);
    }
  }

  // AssetExists returns true when asset with given ID exists in world state.
  @Transaction(false)
  @Returns('boolean')
  public async CenterExists(ctx: Context, code: string): Promise<boolean> {
    const all = await this.GetAllCenters(ctx);
    const filtered = JSON.parse(all).filter((it) => it.code === code);
    return !!filtered.length;
  }

  @Transaction(false)
  @Returns('boolean')
  public async Update(ctx: Context, id: number, code: string, nombre: string): Promise<boolean> {
    const entity: Center = {
      id,
      code,
      nombre,
    };

    try {
      await centerRepo.update(entity);
      await ctx.stub.putState(`CENTER${id}`, Buffer.from(stringify(sortKeysRecursive(entity))));
      return true;
    } catch (err) {
      throw new Error(`Ocurrió un error actualizando el centro`);
    }
  }

  @Transaction(false)
  @Returns('boolean')
  public async Delete(ctx: Context, id: string): Promise<boolean> {
    try {
      await ctx.stub.deleteState(`CENTER${id}`);
      await centerRepo.delete(id);
      return true;
    } catch (err) {
      throw new Error(`Ocurrió un error eliminando el centro`);
    }
  }

}
