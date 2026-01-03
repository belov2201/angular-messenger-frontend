import { UserDto } from '@app/core/store/user';
import { Contact, ContactEntity } from './contacts.interface';

export const mapToContactView = (contactsEntity: ContactEntity[], user: UserDto | null) => {
  if (!user) return [];

  return contactsEntity.reduce((res: Contact[], contactEntity) => {
    const userData = contactEntity.participants.find((participant) => participant.id !== user?.id);

    if (!userData) return res;

    const contact: Contact = {
      ...contactEntity,
      user: userData,
    };

    return [...res, contact];
  }, []);
};
