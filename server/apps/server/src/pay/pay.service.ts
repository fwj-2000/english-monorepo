import { Injectable } from '@nestjs/common';
import type { CreatePayDto } from '@en/common/pay';
import type { TokenPayload } from '@en/common/user'
import { PrismaService, PayService as SharedPayService, ResponseService } from '@libs/shared'
import * as nanoid from 'nanoid'
import dayjs from 'dayjs'
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { TradeStatus } from '@libs/shared/generated/prisma/enums'
import { SocketGateway } from '../socket/socket.gateway';


@Injectable()
export class PayService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sharedPayService: SharedPayService,
    private readonly configService: ConfigService,
    private readonly responseService: ResponseService,
    private readonly socketGateway: SocketGateway,
  ) { }

  private createTradeNo() {
    const prifix = 'EN'; // 订单号前缀
    return `${prifix}-${nanoid.nanoid(12)}`; // 生成唯一订单号
  }

  async create(createPayDto: CreatePayDto, user: TokenPayload) {
    //购买过课程不能重复购买
    const courseRecord = await this.prismaService.courseRecord.findFirst({
      where: {
        userId: user.userId,
        courseId: createPayDto.courseId,
      },
    })
    if (courseRecord) {
      return this.responseService.error(null, '您已经购买过该课程',);
    }

    // 用数据库的事务处理下面逻辑
    const outTradeNo = this.createTradeNo()
    const result = await this.prismaService.$transaction(async (tx) => {
      // 1. 创建订单表 此时状态未支付
      await tx.paymentRecord.create({
        data: {
          userId: user.userId, //用户id
          outTradeNo: outTradeNo, //订单编号
          amount: createPayDto.total_amount, //支付金额
          subject: createPayDto.subject, //支付主题
          body: createPayDto.body, //支付内容
        }
      })
      // 2 . 调用支付宝SDK 获取支付链接
      // https://opendocs.alipay.com/open/59da99d0_alipay.trade.page.pay
      // https://www.npmjs.com/package/alipay-sdk
      const dateTime = dayjs().add(15, 'minute')  // 订单过期时间
      const payUrl = this.sharedPayService.alipaySdk.pageExecute('alipay.trade.page.pay', 'GET', {
        bizContent: {
          out_trade_no: outTradeNo,
          product_code: "FAST_INSTANT_TRADE_PAY",
          subject: createPayDto.subject,
          // 自定义 在回调接口会原样返回 方便回调接口使用这些参数
          body: JSON.stringify({
            courseId: createPayDto.courseId, //课程id
            userId: user.userId, //用户id
          }), //支付内容
          total_amount: createPayDto.total_amount,
          time_expire: dateTime.format('YYYY-MM-DD HH:mm:ss'),

        },
        // 支付成功后支付宝会回调这个接口 这个接口需要公网可访问
        notify_url: `${this.configService.get<string>('ALIPAY_NOTIFY_URL')!}/api/v1/pay/notify`,
      })
      return {
        payUrl, //返回支付宝的支付链接
        timeExpire: dateTime.toDate().getTime() //迎合Elementplus组件要求是时间戳
      }

    })

    return this.responseService.success(result);
  }

  async notify(req: Request) {
    this.prismaService.$transaction(async (tx) => {
      //1.更新支付库 支付时间 + 支付宝交易号 + 支付状态
      const paymentRecord = await tx.paymentRecord.update({
        where: {
          outTradeNo: req.body.out_trade_no, //拿到了订单编号
        },
        data: {
          tradeNo: req.body.trade_no, //拿到了支付宝交易号
          tradeStatus: TradeStatus.TRADE_SUCCESS, //拿到了支付状态
          sendPayTime: dayjs(req.body.gmt_payment).toDate(), //拿到了支付时间
        },
      })
      //2.创建我的课程
      const body = JSON.parse(req.body.body) as { courseId: string, userId: string };
      await tx.courseRecord.create({
        data: {
          userId: body.userId, //拿到了用户id
          courseId: body.courseId, //拿到了课程id
          isPurchased: true, //是否购买
          paymentRecordId: paymentRecord.id, //拿到了支付记录id
        },
      })
      //加一个通知前端socket
      this.socketGateway.emitPaymentSuccess(body.userId);
    })
    return true
  }

}
