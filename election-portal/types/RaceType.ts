export enum RaceType {
  Presidential = 'Presidential',
  Senate = 'Senate',
  House = 'House',
  Gubernatorial = 'Gubernatorial',
}

export const getDataVersion = (race: RaceType) => {
  switch (race) {
    case RaceType.Presidential:
      return "President" 
    case RaceType.Senate:
      return "Senate" 
      case RaceType.House:
    return "House" 
    case RaceType.Gubernatorial:
    return "Governor" 
  }
}