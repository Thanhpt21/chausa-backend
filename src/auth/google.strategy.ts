// // src/auth/strategies/google.strategy.ts
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable } from '@nestjs/common';
// import { Strategy, VerifyCallback } from 'passport-google-oauth20';
// import { ConfigService } from '@nestjs/config';
// import { Request } from 'express';

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//   constructor(configService: ConfigService) {
//     super({
//       // >>> THÊM DẤU '!' SAU KHI GỌI get() <<<
//       clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
//       clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
//       callbackURL: `${configService.get<string>('BACKEND_URL')}/auth/google/callback`,
//       scope: ['email', 'profile'],
//       passReqToCallback: true,
//     });
//   }

//   async validate(
//     req: Request,
//     accessToken: string,
//     refreshToken: string,
//     profile: any,
//     done: VerifyCallback,
//   ): Promise<any> {
//     const { name, emails, photos } = profile;
//     const user = {
//       email: emails[0].value,
//       name: name.givenName + ' ' + name.familyName,
//       photo: photos[0].value,
//       provider: 'google',
//       accessToken,
//     };
//     done(null, user);
//   }
// }