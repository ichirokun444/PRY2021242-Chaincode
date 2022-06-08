/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import { especialidadRepo } from '..';
import { Especialidad } from '../entity/especialidad.entity';

@Info({ title: 'EspecialidadContract', description: 'Smart contract for trading centers' })

export class EspecialidadContract extends Contract {
  constructor() {
    super('EspecialidadContract');
  }

  @Transaction()
  public async InitLedger(ctx: Context): Promise<void> {
    const assets: Especialidad[] = await especialidadRepo.getAll();

    for (const asset of assets) {
      await ctx.stub.putState(`ESPECIALIDAD${asset.id}`, Buffer.from(stringify(sortKeysRecursive(asset))));
    }
  }

  @Transaction(false)
  @Returns('string')
  public async GetAll(ctx: Context): Promise<string> {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('ESPECIALIDAD1', 'ESPECIALIDAD999');
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
  public async Read(ctx: Context, id: string): Promise<string> {
    const assetJSON = await ctx.stub.getState(`ESPECIALIDAD${id}`); // get the asset from chaincode state
    if (!assetJSON || assetJSON.length === 0) {
      throw new Error(`La especialidad ${id} no existe`);
    }
    return assetJSON.toString();
  }

  // CreateAsset issues a new asset to the world state with given details.
  @Transaction()
  public async Create(ctx: Context, code: string, nombre: string): Promise<string> {
    const exists = await this.Exists(ctx, code);
    if (exists) {
      throw new Error(`La especialidad ${code} ya existe`);
    }

    const center: Especialidad = {
      id: 0,
      code,
      nombre,
    };

    try {
      const id = await especialidadRepo.save(center);
      center.id = id;
      await ctx.stub.putState(`ESPECIALIDAD${center.id}`, Buffer.from(stringify(sortKeysRecursive(center))));
      const resp = {
        id: center.id,
      };
      return JSON.stringify(resp);
    } catch (err) {
      throw new Error(`Ocurrió un error registrando la especialidad`);
    }
  }

  // AssetExists returns true when asset with given ID exists in world state.
  @Transaction(false)
  @Returns('boolean')
  public async Exists(ctx: Context, code: string): Promise<boolean> {
    const all = await this.GetAll(ctx);
    const filtered = JSON.parse(all).filter((it) => it.code === code);
    return !!filtered.length;
  }

  @Transaction(false)
  @Returns('boolean')
  public async Update(ctx: Context, id: number, code: string, nombre: string): Promise<boolean> {
    const entity: Especialidad = {
      id,
      code,
      nombre,
    };

    try {
      await especialidadRepo.update(entity);
      await ctx.stub.putState(`ESPECIALIDAD${id}`, Buffer.from(stringify(sortKeysRecursive(entity))));
      return true;
    } catch (err) {
      throw new Error(`Ocurrió un error actualizando la especialidad`);
    }
  }

  @Transaction(false)
  @Returns('boolean')
  public async Delete(ctx: Context, id: string): Promise<boolean> {
    try {
      await ctx.stub.deleteState(`ESPECIALIDAD${id}`);
      await especialidadRepo.delete(id);
      return true;
    } catch (err) {
      throw new Error(`Ocurrió un error eliminando la especialidad`);
    }
  }

}
