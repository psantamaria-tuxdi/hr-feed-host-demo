import { User } from '../user/user.types';

export interface LoginResponseDTO {
  user: User;
  hr_access_token: string;
}
