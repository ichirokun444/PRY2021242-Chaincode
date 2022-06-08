/*
  SPDX-License-Identifier: Apache-2.0
*/

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Historia {
  @Property()
  public id: number;

  @Property()
  public code: string;

  @Property()
  public diagnostico: string;

  @Property()
  public antecedentes: string;

  @Property()
  public tratamiento: string;

  @Property()
  public examenes: string;

  @Property()
  public fecha: string;

  @Property()
  public medico: number;

  @Property()
  public paciente: number;
}
