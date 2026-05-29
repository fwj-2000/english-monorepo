import type { TrackerConfig } from '@en/common/tracker';
import { getFingerprint } from '@/uv';
import { reportEvent } from '@/event';
import { reportError } from '@/error';
import { reportPv } from '@/pv';
import { reportPerformance } from '@/performance';
import { reportFetch } from '@/report';
export class Tracker {
  private config: TrackerConfig
  private visitorId: string | null = null
  private initPromise: Promise<void> | null = null
  constructor(config: TrackerConfig) {
    this.config = config
    this.init() //初始化方法
  }
  //protected 允许子类和内部使用
  protected async init() {
    if (this.initPromise) return this.initPromise //确保他是同一个promise
    //IIFE立即执行函数
    this.initPromise = (async () => {
      let config = this.config
      this.visitorId = await getFingerprint(config)
      reportEvent(this.visitorId, config) //事件上报目前没有visitorId先随便写一个
      reportError(this.visitorId, config) //错误上报目前没有visitorId先随便写一个
      reportPv(this.visitorId, config) //页面上报目前没有visitorId先随便写一个
      reportPerformance(this.visitorId, config) //性能上报目前没有visitorId先随便写一个
    })()
    return this.initPromise
  }

  public async setUserId(userId: string) {
    await this.init()
    let url = this.config.baseUrl + this.config.uv.updateApi
    await reportFetch(url, {
      visitorId: this.visitorId,
      userId: userId
    })
  }
}

// 1. 定义数据库表
// 2.定义数据类型
// 3.实现埋点SDK-前端
// 4.实现埋点SDK-UV上报
// 5.实现埋点Event事件上报
// 6.实现埋点Error错误上报
// 7.实现埋点PV页面上报
// 8.实现埋点Performance性能上报
// 9.实现埋点报告report
// 10.实现埋点SDK-后端
// 11.对接SDK
// 12小节打包SDK