import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  Response,
  Redirect,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from '../../services/app.service';
import { UserService } from '../../services/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  @Get('login')
  @Redirect('', 302)
  getLogin() {
    return {
      url: this.appService.buildUniversalLoginUrl(
        this.configService.get<string>('auth.domain'),
        this.configService.get<string>('auth.audience'),
        this.configService.get<string>('auth.clientId'),
        this.configService.get<string>('auth.audience'),
      ),
    };
  }

  @Get('token')
  async generateToken(@Query() query, @Response() res) {
    const { data, error } = await this.userService.generateToken(query.code);

    if (error) {
      res.status(500).send(error);
    } else {
      res.send(data);
    }
  }

  @Post('register')
  async registerUser(@Request() req, @Response() res) {
    const body = req.body;

    const payload = {
      client_id: this.configService.get<string>('auth.clientId'),
      email: body.email,
      password: body.password,
      connection: this.configService.get<string>('auth.connection'),
      name: body.name,
      nickname: body.nickname,
      picture: body.picture,
    };

    const { data, error } = await this.userService.registerUser(payload);

    if (error) {
      res.status(500).send(error);
    } else {
      res.send(data);
    }
  }
}
