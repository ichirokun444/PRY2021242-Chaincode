import { Context, Contract, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import { userApoderadoRepo } from '..';
import { UsuarioApoderado } from '../entity/usuario-apoderado.entity';

export class UserApoderadoContract extends Contract {
  constructor() {
    super('UserApoderadoContract');
  }

  @Transaction()
  public async InitLedger(ctx: Context): Promise<void> {
    const assets: UsuarioApoderado[] = await userApoderadoRepo.getAll();

    for (const asset of assets) {
      await ctx.stub.putState(`USERAPODERADO${asset.id}`, Buffer.from(stringify(sortKeysRecursive(asset))));
    }
  }

  // GetAllAssets returns all assets found in the world state.
  @Transaction(false)
  @Returns('string')
  public async GetAll(ctx: Context, id: number): Promise<string> {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('USERAPODERADO1', 'USERAPODERADO999');
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

  // GetAllAssets returns all assets found in the world state.
  @Transaction(false)
  @Returns('string')
  public async GetAllPoderdantes(ctx: Context, id: number): Promise<string> {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('USERAPODERADO1', 'USERAPODERADO999');
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

    return JSON.stringify(allResults.filter((it) => it.apoderado === id));
  }

  // CreateAsset issues a new asset to the world state with given details.
  @Transaction()
  public async Create(ctx: Context, usuario: number, apoderado: number): Promise<string> {
    const entity: UsuarioApoderado = {
      id: 0,
      usuario,
      apoderado,
    };

    try {
      const entityId = await userApoderadoRepo.save(entity);
      entity.id = entityId;
      await ctx.stub.putState(`USERAPODERADO${entity.id}`, Buffer.from(stringify(sortKeysRecursive(entity))));
      const resp = {
        id: entity.id,
      };
      return JSON.stringify(resp);
    } catch (err) {
      throw new Error(`Ocurrió un error registrando el apoderado en el usuario`);
    }
  }

  // AssetExists returns true when asset with given ID exists in world state.
  @Transaction(false)
  @Returns('boolean')
  public async Delete(ctx: Context, id: string): Promise<boolean> {
    try {
      await ctx.stub.deleteState(`USERAPODERADO${id}`);
      await userApoderadoRepo.delete(id);
      return true;
    } catch (err) {
      throw new Error(`Ocurrió un error eliminando el apoderado del usuario`);
    }
  }
}
