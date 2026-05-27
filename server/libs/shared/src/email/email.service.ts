import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';//引入邮件服务的库
import { ConfigService } from '@nestjs/config';//读取环境变量

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: nodemailer.Transporter | null = null; //声明一个变量

  constructor(private readonly configService: ConfigService) { }

  async onModuleInit() {
    // https://nodemailer.com/#create-a-transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: Number(this.configService.get<string>('EMAIL_PORT')),
      secure: !!Number(this.configService.get<string>('EMAIL_USE_SSL')), // 两次取反转换为原本布尔值
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      }
    });

    // this.sendEmail(this.configService.get<string>('EMAIL_USER')!, 'Test Subject', '<p>This is a test email.</p>'); // 调用 sendEmail 方法发送测试邮件
  }

  /**
   * 
   * @param to 发送给谁
   * @param subject 标题
   * @param text 内容
   */
  // 参数nodemailer.SendMailOption
  async sendEmail(to: string, subject: string, text: string) {
    try {
      await this.transporter?.sendMail({
        from: this.configService.get<string>('EMAIL_FROM'),
        to,
        subject,
        html: text,
      })
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
} 
