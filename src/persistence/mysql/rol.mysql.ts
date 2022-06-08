import { Pool } from 'mysql';
import { Rol } from '../../entity/rol.entity';

export class RolMySQL {
  constructor(private db: Pool) { }

  public async saveRol(rol: Rol): Promise<number> {
    try {
      const id = await this.rolExistsGetID(rol.code);
      if (id != null) { return id; }

      const q = `INSERT INTO rol VALUES(NULL, '${rol.code}', '${rol.nombre}')`;

      console.log(q);
      return new Promise((resolve, reject) => {
        this.db.query(q, (err, res) => {
          if (err) { return reject(err); }
          resolve(res.insertId);
        });
      });
    } catch (err) {
      throw new Error('Error registrando en base de datos');
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const q = `DELETE FROM rol WHERE id = '${id}';`;
      return new Promise((resolve, reject) => {
        this.db.query(q, (err, res) => {
          if (err) { return reject(err); }
          resolve(true);
        });
      });
    } catch (err) {
      throw new Error('Error eliminando de base de datos');
    }
  }

  public async update(rol: Rol): Promise<boolean> {
    try {
      const q = `UPDATE rol
      SET
      code = '${rol.code}',
      nombre = '${rol.nombre}'
      WHERE id = '${rol.id}'
      `;

      console.log(q);
      return new Promise((resolve, reject) => {
        this.db.query(q, (err, res) => {
          if (err) { return reject(err); }
          resolve(true);
        });
      });
    } catch (err) {
      throw new Error('Error actualizando en base de datos');
    }
  }

  public async getAllRoles(): Promise<Rol[]> {
    const q = `SELECT * FROM rol`;
    return new Promise((resolve, reject) => {
      this.db.query(q, (err, res) => {
        if (err) { return reject(err); }

        resolve(res.map((it) => ({
          id: it.id,
          code: it.code,
          nombre: it.nombre,
        })));
      });
    });
  }

  private async rolExistsGetID(code: string): Promise<number | null> {
    const q = `SELECT id FROM rol r WHERE r.code = '${code}'`;

    console.log(q);
    return new Promise((resolve, reject) => {
      this.db.query(q, (err, res) => {
        if (err) { return reject(err); }
        if (!res.length) { return resolve(null); }
        resolve(res[0].id);
      });
    });
  }

}
