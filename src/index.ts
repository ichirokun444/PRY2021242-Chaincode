/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { createPool } from 'mysql';
import { ApoderadoMySQL } from './persistence/mysql/apoderado.mysql';
import { CenterMySQL } from './persistence/mysql/center.mysql';
import { db_config } from './persistence/mysql/connection.mysql';
import { EspecialidadMySQL } from './persistence/mysql/especialidad.mysql';
import { HistoriaMySQL } from './persistence/mysql/historia.mysql';
import { RolMySQL } from './persistence/mysql/rol.mysql';
import { UserMySQL } from './persistence/mysql/user.mysql';
import { UsuarioCentroMySQL } from './persistence/mysql/usuario-centro.mysql';
import { CenterContract } from './transfer/center.contract';
import { EspecialidadContract } from './transfer/especialidad.contract';
import { HistoriaContract } from './transfer/historia.contract';
import { RolContract } from './transfer/rol.contract';
import { UserApoderadoContract } from './transfer/user-apoderado.contract';
import { UserCentroContract } from './transfer/user-centro.contract';
import { UserContract } from './transfer/user.contract';

export { CenterContract } from './transfer/center.contract';
export { EspecialidadContract } from './transfer/especialidad.contract';
export { HistoriaContract } from './transfer/historia.contract';
export { RolContract } from './transfer/rol.contract';
export { UserApoderadoContract } from './transfer/user-apoderado.contract';
export { UserCentroContract } from './transfer/user-centro.contract';
export { UserContract } from './transfer/user.contract';

export const contracts: any[] = [UserContract, CenterContract, RolContract, HistoriaContract, EspecialidadContract, UserApoderadoContract, UserCentroContract];

var pool = createPool({
  connectionLimit: 10,
  ...db_config
});

export const userRepo = new UserMySQL(pool);
export const centerRepo = new CenterMySQL(pool);
export const especialidadRepo = new EspecialidadMySQL(pool);
export const rolRepo = new RolMySQL(pool);
export const historiaRepo = new HistoriaMySQL(pool);
export const userCentroRepo = new UsuarioCentroMySQL(pool);
export const userApoderadoRepo = new ApoderadoMySQL(pool);
