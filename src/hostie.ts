export enum HostieStatus {
  OFFLINE = 0,
  ONLINE  = 1,
}

export type Hostie = {
  id:         string,
  token:      string,
  name:       string,
  createTime: number,
  updateTime: number,
  note?:      string,
  status:     HostieStatus,
  version?:   string,
  runtime?:   string,
}
