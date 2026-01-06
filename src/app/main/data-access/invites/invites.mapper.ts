import { UserDto } from '@app/core/store/user';
import { InviteEntity, Invite } from './invites.interface';

export const mapToInviteView = (
  inviteEntity: InviteEntity,
  user: UserDto | null,
): Invite | null => {
  if (!user) return null;

  const userData =
    inviteEntity.sender.id === user.id ? inviteEntity.recipient : inviteEntity.sender;

  return {
    ...inviteEntity,
    user: userData,
    isSender: inviteEntity.sender.id === user.id,
  };
};
