import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { ConnectCoupleDto } from './dto/connect-couple.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('connect')
  connect(@Request() req, @Body() connectDto: ConnectCoupleDto) {
    return this.authService.connectCouple(req.user, connectDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Request() req) {
    const user = req.user;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      couple: user.couple ? { id: user.couple.id, name: user.couple.name } : null,
      inviteCode: user.inviteCode,
    };
  }
}
