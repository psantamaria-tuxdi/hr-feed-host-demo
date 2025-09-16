import { BaseDocument } from './../../modules/shared/types/base.type';

export interface User extends BaseDocument {
  externalUserId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  roles: string[];
  avatar?: string;
}
