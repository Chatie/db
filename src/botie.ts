export enum BotieStatus {
  STANDBY = 0,
  READY   = 1,
}

export type Botie = {
  id:         string,
  name:       string,
  note?:      string,
  create_at:  number,
  update_at:  number,
  status:     BotieStatus,
  hostieId?:  string,
}
