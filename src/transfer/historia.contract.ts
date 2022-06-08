/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import { historiaRepo } from '..';
import { Historia } from '../entity/historia.entity';

@Info({ title: 'HistoriaContract', description: 'Smart contract for trading roles' })

export class HistoriaContract extends Contract {
  constructor() {
    super('HistoriaContract');
  }

  @Transaction()
  public async InitLedger(ctx: Context): Promise<void> {
    const assets: Historia[] = await historiaRepo.getAll();

    for (const asset of assets) {
      await ctx.stub.putState(`HISTORIA${asset.id}`, Buffer.from(stringify(sortKeysRecursive(asset))));
    }
  }

  @Transaction(false)
  @Returns('string')
  public async GetAll(ctx: Context): Promise<string> {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('HISTORIA1', 'HISTORIA999');
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
  public async Read(ctx: Context, code: string): Promise<string> {
    const assetJSON = await ctx.stub.getState(`HISTORIA${code}`); // get the asset from chaincode state
    if (!assetJSON || assetJSON.length === 0) {
      throw new Error(`The historia ${code} does not exist`);
    }
    return assetJSON.toString();
  }

  // CreateAsset issues a new asset to the world state with given details.
  @Transaction()
  public async Create(ctx: Context, code: string, diagnostico: string, antecedentes: string,
    tratamiento: string, examenes: string, fecha: string, medico: number, paciente: number): Promise<string> {
    const exists = await this.HistoriaExists(ctx, String(code));
    if (exists) {
      throw new Error(`La historia clínica ${code} ya se encuentra registrada`);
    }

    const historia: Historia = {
      id: 0,
      code,
      diagnostico,
      antecedentes,
      tratamiento,
      examenes,
      fecha,
      medico,
      paciente,
    };

    try {
      const id = await historiaRepo.save(historia);
      historia.id = id;
      await ctx.stub.putState(`HISTORIA${historia.id}`, Buffer.from(stringify(sortKeysRecursive(historia))));
      const resp = {
        id: historia.id,
      };
      return JSON.stringify(resp);
    } catch (err) {
      throw new Error(`Ocurrió un error registrando la historia`);
    }
  }

  @Transaction(false)
  @Returns('boolean')
  public async HistoriaExists(ctx: Context, code: string): Promise<boolean> {
    const all = await this.GetAll(ctx);
    const filtered = JSON.parse(all).filter((it) => it.code === code);
    return !!filtered.length;
  }

  @Transaction(false)
  @Returns('boolean')
  public async Update(ctx: Context, id: number, code: string, diagnostico: string, antecedentes: string,
    tratamiento: string, examenes: string, fecha: string, medico: number, paciente: number): Promise<boolean> {
    const entity: Historia = {
      id,
      code,
      antecedentes,
      diagnostico,
      examenes,
      fecha,
      medico,
      paciente,
      tratamiento,
    };

    try {
      await historiaRepo.update(entity);
      await ctx.stub.putState(`HISTORIA${id}`, Buffer.from(stringify(sortKeysRecursive(entity))));
      return true;
    } catch (err) {
      throw new Error(`Ocurrió un error actualizando la historia`);
    }
  }

  @Transaction(false)
  @Returns('boolean')
  public async Delete(ctx: Context, id: string): Promise<boolean> {
    try {
      await ctx.stub.deleteState(`HISTORIA${id}`);
      await historiaRepo.delete(id);
      return true;
    } catch (err) {
      throw new Error(`Ocurrió un error eliminando la historia`);
    }
  }

}
