import { Injectable, OnModuleInit } from '@nestjs/common';
import { AlipaySdk } from 'alipay-sdk'
import { ConfigService } from '@nestjs/config';
@Injectable()
export class PayService implements OnModuleInit {
  public alipaySdk: AlipaySdk;
  constructor(private readonly configService: ConfigService) { }
  async onModuleInit() {
    this.alipaySdk = new AlipaySdk({
      appId: this.configService.get<string>('ALIPAY_APP_ID')!,
      privateKey: this.configService.get<string>('ALIPAY_PRIVATE_KEY')!,
      alipayPublicKey: this.configService.get<string>('ALIPAY_PUBLIC_KEY')!,
      gateway: this.configService.get<string>('ALIPAY_GATEWAY')!,
    });

    // const bizContent = {
    //   out_trade_no: "ALIPfdf1211sdfsd12gfddsgs3",
    //   product_code: "FAST_INSTANT_TRADE_PAY",
    //   subject: "abc",
    //   body: "234",
    //   total_amount: "0.01"
    // };

    // // 支付页面接口，返回支付链接，交由用户打开，会跳转至支付宝网站
    // const url = this.alipaySdk.pageExecute('alipay.trade.page.pay', 'GET', {
    //   bizContent,
    //   returnUrl: 'https://www.taobao.com'
    // });
    // console.log("🚀 ~ PayService ~ onModuleInit ~ url:", url)
  }
  getAlipaySdk() {
    return this.alipaySdk;
  }
}