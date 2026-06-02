import { TrackerConfig } from '@en/common/tracker';
export declare const getBrowserInfo: () => {
    browser: string | undefined;
    os: string | undefined;
    device: import('ua-parser-js').DeviceTypes;
};
export declare const getFingerprint: (config: TrackerConfig) => Promise<any>;
//# sourceMappingURL=index.d.ts.map