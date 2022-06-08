/*
  SPDX-License-Identifier: Apache-2.0
*/

import { Object, Property } from 'fabric-contract-api';

@Object()
export class User {
  @Property()
  public id: number;

  @Property()
  public dni: string;

  @Property()
  public idRol: number;

  @Property()
  public especialidad?: number;

  @Property()
  public nombres: string;

  @Property()
  public apellidos: string;

  @Property()
  public fechaNac: string;

  @Property()
  public password: string;

  @Property()
  public status: string;

  @Property()
  public genero: string;

  @Property()
  public correo: string;

  @Property()
  public direccion: string;

  @Property()
  public numTelefonico: string;
}
