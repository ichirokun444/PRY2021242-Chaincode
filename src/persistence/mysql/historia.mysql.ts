import { Pool } from "mysql";
import { Historia } from "../../entity/historia.entity";

export class HistoriaMySQL {
  constructor(private db: Pool) { }

  async save(h: Historia): Promise<number> {
    try {
      const id = await this.getIdIfExist(h.code);
      if (id != null) return id;

      const q = `INSERT INTO historia_clinica VALUES(NULL, '${h.code}', '${h.diagnostico}', '${h.antecedentes}', '${h.tratamiento}','${h.examenes}','${h.fecha}', ${h.medico}, ${h.paciente})`;

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
      const q = `DELETE FROM historia_clinica WHERE id = '${id}';`
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

  async update(historia: Historia): Promise<boolean> {
    try {
      const q = `UPDATE historia_clinica
      SET 
      code = '${historia.code}',
      diagnostico = '${historia.diagnostico}',
      antecedentes = '${historia.antecedentes}',
      tratamiento = '${historia.tratamiento}',
      examenes = '${historia.examenes}',
      fecha = '${historia.fecha}',
      medico = '${historia.medico}',
      paciente = '${historia.paciente}'
      WHERE id = '${historia.id}'
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


  async getIdIfExist(code: string): Promise<number | null> {
    const q = `SELECT id FROM historia_clinica h WHERE h.code = '${code}'`;

    console.log(q);
    return new Promise((resolve, reject) => {
      this.db.query(q, (err, res) => {
        if (err) return reject(err);
        if (!res.length) return resolve(null);
        resolve(res[0].id);
      });
    });
  }

  async getAll(): Promise<Historia[]> {
    const q = `SELECT * FROM historia_clinica`;
    return new Promise((resolve, reject) => {
      this.db.query(q, (err, res) => {
        if (err) return reject(err);
        // resolve(res);
        resolve(res.map(it => ({
          id: it.id,
          code: it.code,
          diagnostico: it.diagnostico,
          antecedentes: it.antecedentes,
          tratamiento: it.tratamiento,
          examenes: it.examenes,
          fecha: it.fecha,
          medico: it.medico,
          paciente: it.paciente,
        })));
      })
    });
  }

}
