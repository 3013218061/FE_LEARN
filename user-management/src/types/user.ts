export type UserStatus = 'enabled' | 'disabled';

export interface UserVO {
  id: number;
  name: string;
  role: string;
  status: UserStatus;
}

export interface CreateUserRequest {
  name: string;
  role: string;
  status: UserStatus;
}

export interface UpdateUserRequest {
  id: number;
  name: string;
  role: string;
  status: UserStatus;
}

export interface FetchUsersParams {
  keyword?: string;
  shouldFail?: boolean;
}
