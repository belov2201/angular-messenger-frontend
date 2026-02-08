import { getMessageGroupDate } from './lib';

describe('MessagesLib', () => {
  describe('get message group date', () => {
    beforeEach(() => {
      jasmine.clock().install();
      const mockDate = new Date(2026, 1, 22, 8);
      jasmine.clock().mockDate(mockDate);
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('show today', () => {
      expect(getMessageGroupDate(new Date('2026-02-22T07:00:00.000'))).toBe('Сегодня');
    });

    it('show yesterday', () => {
      expect(getMessageGroupDate(new Date('2026-02-21T07:00:00.000'))).toBe('Вчера');
    });

    it('show yesterday', () => {
      expect(getMessageGroupDate(new Date('2026-02-21T15:00:00.000'))).toBe('Вчера');
    });

    it('show 20 february', () => {
      expect(getMessageGroupDate(new Date('2026-02-20T01:00:00.000'))).toBe('20 февраля');
    });

    it('show full date', () => {
      expect(getMessageGroupDate(new Date('2025-02-20T01:00:00.000'))).toBe('20 февраля 2025');
    });
  });
});
