import { Role } from 'src/common/roles/role.enum';

export interface UserPayload {
  email: string;
  userId: number;
  roles: Role[];
  timestamp: number;
}
