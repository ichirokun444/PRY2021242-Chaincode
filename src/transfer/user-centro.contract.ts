import { Context, Contract, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import { userCentroRepo } from '..';
import { UsuarioCentro } from '../entity/usuario-centro.entity';

export class UserCentroContract extends Contract {
  constructor() {
    super('UserCentroContract');
  }

  @Transaction()
  public async InitLedger(ctx: Context): Promise<void> {
    const assets: UsuarioCentro[] = await userCentroRepo.getAll();

    for (const asset of assets) {
      await ctx.stub.putState(`USERCENTRO${asset.id}`, Buffer.from(stringify(sortKeysRecursive(asset))));
    }
  }

  // GetAllAssets returns all assets found in the world state.
  @Transaction(false)
  @Returns('string')
  public async GetAll(ctx: Context, id: number): Promise<string> {
    const allResults = [];
    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange('USERCENTRO1', 'USERCENTRO999');
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

    return JSON.stringify(allResults.filter((it) => it.usuario === id));
  }

  // CreateAsset issues a new asset to the world state with given details.
  @Transaction()
  public async Create(ctx: Context, usuario: number, centro: number): Promise<string> {
    const entity: UsuarioCentro = {
      id: 0,
      usuario,
      centro,
    };

    try {
      const entityId = await userCentroRepo.save(entity);
      entity.id = entityId;
      await ctx.stub.putState(`USERCENTRO${entity.id}`, Buffer.from(stringify(sortKeysRecursive(entity))));
      const resp = {
        id: entity.id,
      };
      return JSON.stringify(resp);
    } catch (err) {
      throw new Error(`Ocurrió un error registrando el centro en el usuario`);
    }
  }

  // AssetExists returns true when asset with given ID exists in world state.
  @Transaction(false)
  @Returns('boolean')
  public async Delete(ctx: Context, id: string): Promise<boolean> {
    try {
      await ctx.stub.deleteState(`USERCENTRO${id}`);
      await userCentroRepo.delete(id);
      return true;
    } catch (err) {
      throw new Error(`Ocurrió un error eliminando el centro del usuario`);
    }
  }
}
