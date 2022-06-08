import { Pool } from "mysql";
import { UsuarioCentro } from "../../entity/usuario-centro.entity";

export class UsuarioCentroMySQL {
  constructor(private db: Pool) { }

  async getAll(): Promise<UsuarioCentro[]> {
    const q = `SELECT * FROM usuario_centros`;
    return new Promise((resolve, reject) => {
      this.db.query(q, (err, res) => {
        if (err) return reject(err);

        resolve(res.map(it => ({
          id: it.id,
          usuario: +it.usuario,
          apoderado: +it.apoderado,
        })));
      })
    });
  }

  async save(entity: UsuarioCentro): Promise<number> {
    const q = `INSERT INTO usuario_centros VALUES(NULL, ${entity.usuario}, ${entity.centro})`;
    const userId = await this.ifExistGetID(entity);
    if (userId != null) return userId;

    return new Promise((resolve, reject) => {
      this.db.query(q, (err, res) => {
        if (err) return reject(err);
        resolve(res.insertId);
      })
    });
  }

  async delete(id: string): Promise<void> {
    const q = `DELETE FROM usuario_centros WHERE id = ${id}`;

    return new Promise((resolve, reject) => {
      this.db.query(q, (err, res) => {
        if (err) return reject(err);
        resolve();
      })
    });
  }

  async ifExistGetID(entity: UsuarioCentro): Promise<number | null> {
    const q = `SELECT id FROM usuario_centros u WHERE u.usuario = '${entity.usuario}' AND u.centro = ${entity.centro}`;

    return new Promise((resolve, reject) => {
      this.db.query(q, (err, res) => {
        if (err) return reject(err);
        if (!res.length) return resolve(null);
        resolve(res[0].id);
      });
    });
  }

}
