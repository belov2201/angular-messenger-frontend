import { UserDto } from '@app/core/store/user';
import { InviteEntity, Invite } from './invites.interface';

export const mapToInviteView = (invitesEntity: InviteEntity[], user: UserDto | null) => {
  if (!user) return [];

  return invitesEntity.reduce((res: Invite[], inviteEntity: InviteEntity) => {
    const userData =
      inviteEntity.sender.id === user.id ? inviteEntity.recipient : inviteEntity.sender;

    const invite: Invite = {
      ...inviteEntity,
      user: userData,
      isSender: inviteEntity.sender.id === user.id,
    };

    return [...res, invite];
  }, []);
};
