export enum BotieStatus {
  STANDBY = 0,
  READY   = 1,
}

export type Botie = {
  createdAt:  number,
  hostieId?:  string,
  id:         string,
  name:       string,
  note?:      string,
  status:     BotieStatus,
  updatedAt:  number,
}
