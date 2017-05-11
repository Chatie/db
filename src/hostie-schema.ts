export enum HostieStatus {
  OFFLINE = 0,
  ONLINE  = 1,
}

export enum HostieRuntime {
  UNKNOWN   = 0,
  LINUX     = 1,
  WINDOWS   = 2,
  APPLE     = 3,
  DOCKER    = 4,
  ELECTRON  = 5,
}

export interface Hostie {
  email:      string,
  create_at:  number,
  id?:        string,
  name:       string,
  note?:      string,
  runtime?:   HostieRuntime,
  status:     HostieStatus,
  token:      string,
  update_at:  number,
  version?:   string,
}
