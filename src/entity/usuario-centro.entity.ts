/*
  SPDX-License-Identifier: Apache-2.0
*/

import { Object, Property } from 'fabric-contract-api';

@Object()
export class UsuarioCentro {
  @Property()
  public id: number;

  @Property()
  public usuario: number;

  @Property()
  public centro: number;
}
