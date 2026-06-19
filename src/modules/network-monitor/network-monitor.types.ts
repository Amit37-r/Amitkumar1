export interface IConnectivityStatus {
  isOnline: boolean;
  checkedAt: Date;
  latencyMs?: number;
}
