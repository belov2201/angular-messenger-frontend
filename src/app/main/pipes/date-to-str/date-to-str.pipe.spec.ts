import { DateToStrPipe } from './date-to-str.pipe';

describe('DateToStrPipe', () => {
  let pipe: DateToStrPipe;

  beforeEach(() => {
    pipe = new DateToStrPipe();
    jasmine.clock().install();
    const mockDate = new Date(2026, 1, 22, 8);
    jasmine.clock().mockDate(mockDate);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('show 07:00', () => {
    expect(pipe.transform('2026-02-22T07:00:00.000')).toBe('07:00');
  });

  it('show yesterday', () => {
    expect(pipe.transform('2026-02-21T08:00:00.000')).toBe('вчера');
  });

  it('show yesterday', () => {
    expect(pipe.transform('2026-02-21T07:00:00.000')).toBe('вчера');
  });

  it('show yesterday', () => {
    expect(pipe.transform('2026-02-21T01:00:00.000')).toBe('вчера');
  });

  it('show date', () => {
    expect(pipe.transform('2026-02-20T08:00:00.000')).toBe('20.02');
  });

  it('show date', () => {
    expect(pipe.transform('2026-02-20T07:00:00.000')).toBe('20.02');
  });

  it('show full date', () => {
    expect(pipe.transform('2025-02-20T07:00:00.000')).toBe('20.02.2025');
  });
});
