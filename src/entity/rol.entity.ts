/*
  SPDX-License-Identifier: Apache-2.0
*/

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Rol {
  @Property()
  public id: number;

  @Property()
  public code: string;

  @Property()
  public nombre: string;
}
