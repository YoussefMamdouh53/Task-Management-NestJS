import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './get-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    @Post('/signup')
    async signUp(@Body() authCredentialDto : AuthCredentialDto) : Promise<void> {
        return this.authService.signUp(authCredentialDto);
    }
    @Post('/signin')
    async signIn(@Body() authCredentialDto : AuthCredentialDto) : Promise<{accessToken: string}> {
        return this.authService.signIn(authCredentialDto);
    }

    @Post('/test')
    @UseGuards(AuthGuard())
    test(@GetUser() user : User){
        console.log(user);
    }
}
