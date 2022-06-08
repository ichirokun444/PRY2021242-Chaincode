import { Pool } from "mysql";
import { Especialidad } from "../../entity/especialidad.entity";

export class EspecialidadMySQL {
  constructor(private db: Pool) { }

  async save(especialidad: Especialidad): Promise<number> {
    try {
      const id = await this.ifExistsGetID(especialidad.code);
      if (id != null) return id;

      const q = `INSERT INTO especialidades VALUES(NULL, '${especialidad.code}', '${especialidad.nombre}')`;

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
      const q = `DELETE FROM especialidades WHERE id = '${id}';`
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

  async update(especialidad: Especialidad): Promise<boolean> {
    try {
      const q = `UPDATE especialidades
      SET 
      code = '${especialidad.code}',
      nombre = '${especialidad.nombre}'
      WHERE id = '${especialidad.id}'
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


  async ifExistsGetID(code: string): Promise<number | null> {
    const q = `SELECT id FROM especialidades c WHERE c.code = '${code}'`;

    console.log(q);
    return new Promise((resolve, reject) => {
      this.db.query(q, (err, res) => {
        if (err) return reject(err);
        if (!res.length) return resolve(null);
        resolve(res[0].id);
      });
    });
  }

  async getAll(): Promise<Especialidad[]> {
    const q = `SELECT * FROM especialidades`;
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
