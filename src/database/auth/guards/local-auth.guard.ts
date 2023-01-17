import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor() {
    super();
  }
  // handleRequest(err, user, _info) {
  //   console.log(err);
  //   console.log(user);
  //   console.log('info' , _info);
  //   return user;
  //  // return user;
  // }
}
