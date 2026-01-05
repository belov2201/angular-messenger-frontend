export interface UserDto {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  inviteCode: string;
  avatar: string | null;
}

export type UserEntity = UserDto;

export type ParticipantDto = Omit<UserDto, 'inviteCode'>;

export interface AuthDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  repeatPassword: string;
  firstName: string;
  lastName: string;
}

export type EditUserDto = Partial<Pick<UserDto, 'firstName' | 'lastName' | 'avatar'>>;

export interface EditUserAvatarDto {
  avatar: File | null;
}

export interface EditUserAvatarResponse {
  fileName: string;
}
