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
