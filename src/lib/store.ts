import { isCloudSyncEnabled } from "./config";
import { localStore } from "./local-store";
import { remoteStore } from "./remote-store";

export const store = isCloudSyncEnabled ? remoteStore : localStore;
