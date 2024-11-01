import { RaceType, Year, State } from '../../../types/SharedInfoType';

export const breakdownToMenubarSpan = (
  breakdown: RaceType,
  currentBreakdown: RaceType
): React.ReactNode => {
  let str: string = '';
  const selected: boolean = breakdown === currentBreakdown;
  switch (breakdown) {
    case RaceType.Presidential:
      str = 'Pres.';
      break;
    case RaceType.Senate:
      str = 'Sen.';
      break;
    case RaceType.Gubernatorial:
      str = 'Gub.';
      break;
    case RaceType.House:
      str = 'Hse.';
      break;
    default:
      str = 'Unk.';
      break;
  }
  return (
    <span
      style={{
        color: selected ? '#ffffff' : '#dddddd',
        textShadow: selected ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
      }}
    >
      {str}
    </span>
  );
};

export const yearToMenubarSpan = (
  year: Year,
  currentYear: Year
): React.ReactNode => {
  let str = '';
  const selected: boolean = year === currentYear;
  switch (year) {
    case Year.TwentyFour:
      str = '2024';
      break;
    case Year.TwentyTwo:
      str = '2022';
      break;
    case Year.Twenty:
      str = '2020';
      break;
    case Year.Eighteen:
      str = '2018';
      break;
    case Year.Sixteen:
      str = '2016';
      break;
    case Year.Fourteen:
      str = '2014';
      break;
    case Year.Twelve:
      str = '2012';
      break;
    default:
      str = 'Unk.';
      break;
  }
  return (
    <span
      style={{
        color: selected ? '#ffffff' : '#dddddd',
        textShadow: selected ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
      }}
    >
      {str}
    </span>
  );
};
