export enum HostieStatus {
  OFFLINE = 0,
  ONLINE  = 1,
}

export enum HostieRuntime {
  UNKNOWN = 0,
  DOCKER  = 1,
  LINUX   = 2,
  WINDOWS = 3,
  APPLE   = 4,
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
  runtime?:   HostieRuntime,
}
