import {forwardRef, Inject, Injectable, UnauthorizedException,} from '@nestjs/common';
import {JwtService, JwtSignOptions} from '@nestjs/jwt';
import {environments} from '../../../environments/environments';
import {User} from '../../user/schema/user.schema';
import {UserService} from '../../user/service/user.service';
import {Token} from '../guard/jwt-auth.guard';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface SocialUser {
  id: number | string;
  name: string;
  email: string;
}

export type GetSocialUserHandler = () => Promise<Partial<SocialUser>>;

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService)) private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validate(username: string, password: string) {
    const user = await this.userService.getUser(username);

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    if (!(await user.validatePassword(password))) {
      throw new UnauthorizedException('Incorrect password');
    }

    return user;
  }

  async login(user: User): Promise<TokenResponse> {
    const payload: Token = {
      sub: user.id,
      username: user.username,
    };

    let refresh_token: string;

    if (environments.accessTokenExpiration) {
      refresh_token = await this.jwtService.signAsync(
        payload,
        this.getRefreshTokenOptions(user),
      );
    }

    return {
      access_token: await this.jwtService.signAsync(
        payload,
        this.getAccessTokenOptions(user),
      ),
      refresh_token,
    };
  }

  async loginWithRefreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.decode(refreshToken) as Token;

      if (!decoded) {
        throw new Error();
      }

      const user = await this.userService.validateUserById(decoded.sub);

      await this.jwtService.verifyAsync<Token>(
        refreshToken,
        this.getRefreshTokenOptions(user),
      );

      return this.login(user);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  getRefreshTokenOptions(user: User): JwtSignOptions {
    return this.getTokenOptions('refresh', user);
  }

  getAccessTokenOptions(user: User): JwtSignOptions {
    return this.getTokenOptions('access', user);
  }

  private getTokenOptions(type: 'refresh' | 'access', user: User) {
    const options: JwtSignOptions = {
      secret: environments[type + 'TokenSecret'] + user.sessionToken,
    };

    const expiration = environments[type + 'TokenExpiration'];

    if (expiration) {
      options.expiresIn = expiration;
    }

    return options;
  }
}
