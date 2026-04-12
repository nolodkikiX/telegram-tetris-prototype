export interface AppRuntimeInfo {
  isTelegram: boolean;
  label: 'Telegram Mini App' | 'Browser preview';
}

let runtimeInfo: AppRuntimeInfo = {
  isTelegram: false,
  label: 'Browser preview',
};

export function setAppRuntimeInfo(info: AppRuntimeInfo): void {
  runtimeInfo = info;
}

export function getAppRuntimeInfo(): AppRuntimeInfo {
  return runtimeInfo;
}
