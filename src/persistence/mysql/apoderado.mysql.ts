import { Pool } from "mysql";
import { UsuarioApoderado } from "../../entity/usuario-apoderado.entity";

export class ApoderadoMySQL {
  constructor(private db: Pool) { }

  async getAll(): Promise<UsuarioApoderado[]> {
    const q = `SELECT * FROM usuario_apoderados`;
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

  async save(entity: UsuarioApoderado): Promise<number> {
    const q = `INSERT INTO usuario_apoderados VALUES(NULL, ${entity.usuario}, ${entity.apoderado})`;
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
    const q = `DELETE FROM usuario_apoderados WHERE id = ${id}`;

    return new Promise((resolve, reject) => {
      this.db.query(q, (err, res) => {
        if (err) return reject(err);
        resolve();
      })
    });
  }

  async ifExistGetID(entity: UsuarioApoderado): Promise<number | null> {
    const q = `SELECT id FROM usuario_apoderados u WHERE u.usuario = '${entity.usuario}' AND u.apoderado = ${entity.apoderado}`;

    return new Promise((resolve, reject) => {
      this.db.query(q, (err, res) => {
        if (err) return reject(err);
        if (!res.length) return resolve(null);
        resolve(res[0].id);
      });
    });
  }

}
