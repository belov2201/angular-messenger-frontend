import { UserDto } from '@app/core/store/user';
import { Contact, ContactEntity } from './contacts.interface';

export const mapToContactView = (
  contactEntity: ContactEntity,
  user: UserDto | null,
): Contact | null => {
  const userData = contactEntity.participants.find((participant) => participant.id !== user?.id);

  if (!userData) return null;

  return {
    ...contactEntity,
    user: userData,
  };
};
