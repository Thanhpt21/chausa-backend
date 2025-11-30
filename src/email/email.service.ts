// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendResetPasswordEmail(to: string, resetLink: string): Promise<void> {
    const mailOptions = {
      from: `"Ecommerce App" <${this.configService.get('EMAIL_USER')}>`,
      to,
      subject: 'Đặt lại mật khẩu',
      html: `
        <p>Chào bạn,</p>
        <p>Nhấn vào liên kết sau để đặt lại mật khẩu:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Liên kết sẽ hết hạn sau 30 phút.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
