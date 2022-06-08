import { Pool } from 'mysql';
import { User } from '../../entity/user.entity';

export class UserMySQL {
  constructor(private db: Pool) { }

  public async saveUser(user: User): Promise<number> {
    try {
      const userId = await this.userExistsGetDNI(user.dni);
      if (userId != null) { return userId; }

      const especialidad = user.especialidad ? `'${user.especialidad}'` : 'NULL';

      const q = `INSERT INTO usuario VALUES(NULL, '${user.dni}', '${user.nombres}', '${user.apellidos}', '${user.correo}', '${user.password}','${user.fechaNac}', '${user.genero}', '${user.direccion}', '${user.numTelefonico}', '${user.idRol}', '${user.status}',${especialidad})`;

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
      const q = `DELETE FROM usuario WHERE id = '${id}';`;
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

  public async updatePassword(user: User): Promise<boolean> {
    try {
      const q = `UPDATE usuario
      SET
      password = '${user.password}'
      WHERE id = '${user.id}'
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

  public async update(user: User): Promise<boolean> {
    const especialidad = user.especialidad ? user.especialidad : 'NULL';
    try {
      const q = `UPDATE usuario
      SET
      dni = '${user.dni}',
      nombres = '${user.nombres}',
      apellidos = '${user.apellidos}',
      correo = '${user.correo}',
      fecha_nac = '${user.fechaNac}',
      status = '${user.status}',
      especialidad = ${especialidad},
      genero = '${user.genero}',
      direccion = '${user.direccion}',
      num_telefonico = '${user.numTelefonico}',
      rol = '${user.idRol}'
      WHERE id = '${user.id}'
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

  public async userExistsGetDNI(dni: string): Promise<number | null> {
    const q = `SELECT id FROM usuario u WHERE u.dni = '${dni}'`;

    console.log(q);
    return new Promise((resolve, reject) => {
      this.db.query(q, (err, res) => {
        if (err) { return reject(err); }
        if (!res.length) { return resolve(null); }
        resolve(res[0].id);
      });
    });
  }

  public async getAllUsers(): Promise<User[]> {
    const q = `SELECT * FROM usuario`;
    return new Promise((resolve, reject) => {
      this.db.query(q, (err, res) => {
        if (err) { return reject(err); }

        resolve(res.map((it) => ({
          id: it.id,
          dni: it.dni,
          nombres: it.nombres,
          apellidos: it.apellidos,
          correo: it.correo,
          password: it.password,
          fechaNac: it.fecha_nac,
          genero: it.genero,
          especialidad: it.especialidad,
          status: it.status,
          direccion: it.direccion,
          numTelefonico: it.num_telefonico,
          idRol: +it.rol,
        })));
      });
    });
  }

}
