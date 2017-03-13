export enum BotieStatus {
  STANDBY = 0,
  READY   = 1,
}

export type Botie = {
  id:         string,
  name:       string,
  note?:      string,
  createTime: number,
  updateTime: number,
  status:     BotieStatus,
  hostieId?:  string,
}
