import { Pool } from "mysql";
import { Center } from "../../entity/center.entity";

export class CenterMySQL {
  constructor(private db: Pool) { }

  async saveCenter(center: Center): Promise<number> {
    try {
      const id = await this.centerExistsGetID(center.code);
      if (id != null) return id;

      const q = `INSERT INTO centro_salud VALUES(NULL, '${center.code}', '${center.nombre}')`;

      console.log(q);
      return new Promise((resolve, reject) => {
        this.db.query(q, (err, res) => {
          if (err) return reject(err);
          resolve(res.insertId);
        });
      });
    } catch (err) {
      throw new Error("Error registrando en base de datos");
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const q = `DELETE FROM centro_salud WHERE id = '${id}';`
      return new Promise((resolve, reject) => {
        this.db.query(q, (err, res) => {
          if (err) return reject(err);
          resolve(true);
        });
      });
    } catch (err) {
      throw new Error("Error registrando en base de datos");
    }
  }

  async update(center: Center): Promise<boolean> {
    try {
      const q = `UPDATE centro_salud
      SET 
      code = '${center.code}',
      nombre = '${center.nombre}'
      WHERE id = '${center.id}'
      `;

      console.log(q);
      return new Promise((resolve, reject) => {
        this.db.query(q, (err, res) => {
          if (err) return reject(err);
          resolve(true);
        });
      });
    } catch (err) {
      throw new Error("Error registrando en base de datos");
    }
  }


  async centerExistsGetID(code: string): Promise<number | null> {
    const q = `SELECT id FROM centro_salud c WHERE c.code = '${code}'`;

    console.log(q);
    return new Promise((resolve, reject) => {
      this.db.query(q, (err, res) => {
        if (err) return reject(err);
        if (!res.length) return resolve(null);
        resolve(res[0].id);
      });
    });
  }

  async getAllCenters(): Promise<Center[]> {
    const q = `SELECT * FROM centro_salud`;
    return new Promise((resolve, reject) => {
      this.db.query(q, (err, res) => {
        if (err) return reject(err);

        resolve(res.map(it => ({
          id: it.id,
          code: it.code,
          nombre: it.nombre,
        })));
      })
    });
  }

}
