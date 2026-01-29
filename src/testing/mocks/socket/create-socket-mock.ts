import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';

export const createSocketMock = () => {
  const socketSpy: jasmine.SpyObj<Socket> = jasmine.createSpyObj('Socket', [
    'fromEvent',
    'connect',
    'disconnect',
  ]);

  socketSpy.fromEvent.and.returnValue(new Subject());

  return socketSpy;
};
