const additionDateData = (val: number) => {
  if (val.toString().length < 2) return `0${val}`;
  return val;
};

export const getFormatTime = (hours: number, minutes: number) => {
  return [hours, minutes].map(additionDateData).join(':');
};

export const getFormatDate = (values: number[]) => {
  return values.map(additionDateData).join('.');
};

export const getFormatTimeForSeconds = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return [m, additionDateData(s)].join(':');
};
