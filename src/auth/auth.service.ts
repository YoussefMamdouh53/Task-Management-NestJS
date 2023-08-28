import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import * as sha256 from 'crypto-js/sha256';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService : JwtService
  ) {}
  async signUp(authCredentialDto: AuthCredentialDto): Promise<void> {
    const { username, password } = authCredentialDto;
    const user = new User();
    user.salt = crypto.randomBytes(16).toString('base64');
    const hashedPassword = this.hashPassword(password, user.salt);
    user.username = username;
    user.password = hashedPassword;

    try {
      await user.save();
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Username already exists');
      } else {
        this.logger.error(`failed to Signup`,err);
        throw new InternalServerErrorException();
      }
    }
  }
  async signIn(authCredentialDto: AuthCredentialDto): Promise<{accessToken: string}> {
    const username = await this.validateUserPassword(authCredentialDto);
    if (!username) {
        throw new UnauthorizedException('Invalid credentials');
    }
    const payload : JwtPayload = {username};
    const accessToken = await this.jwtService.sign(payload);

    this.logger.debug(`Generated JWT Token with payload: ${JSON.stringify(payload)}`);
    return {accessToken};
  }

  private hashPassword(password: string, salt: string): string {
    return sha256(password + salt).toString();
  }

  private async validateUserPassword(
    authCredentialDto: AuthCredentialDto,
  ): Promise<string> {
    const { username, password } = authCredentialDto;
    const user = await this.userRepository.findOne({where: { username },
    });
    if (user) {
      const hashedInputPassword = this.hashPassword(password, user.salt);
      if (user.password === hashedInputPassword) {
        return username;
      } else {
        return null;
      }
    }
    return null;
  }
}
