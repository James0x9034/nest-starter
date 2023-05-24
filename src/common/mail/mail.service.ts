import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendVerifyToken(token: string, email: string) {
    try {
      const url = `${process.env.APP_HOST}:${process.env.APP_PORT}/${process.env.APP_PREFIX_API}/auth/verify/?token=${token}`;
      await this.mailerService.sendMail({
        to: email,
        subject: '[Trading Eagle] Register verify email',
        template: './RegisterVerify',
        context: {
          name: email,
          url,
        },
      });

      Logger.log(`Send email to ${email} success`);
      return 'success';
    } catch (err) {
      Logger.log(`Send email to ${email} error`, err);
    }
  }
}
