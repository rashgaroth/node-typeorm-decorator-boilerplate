import { Authorized, JsonController, Post } from 'routing-controllers';

import { Dto } from '@/decorators/dto.decorator';
import { ApiDto, OpenAPI } from '@/docs/openapi/decorators';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthorizeDto } from '@/modules/auth/dto/authorize.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';

@OpenAPI({
  security: [],
})
@JsonController('/auth')
export class AuthController {
  authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  @Get('/health')
  healthCheck() {
    return 'OK';
  }

  @Post('/authorize')
  @ApiDto(AuthorizeDto, {
    summary: 'Authorize user to access the application',
  })
  async authorize(@Dto(AuthorizeDto) dto: AuthorizeDto) {
    return await this.authService.authorize(dto);
  }

  @Post('/admin/register')
  @Authorized(['superadmin'])
  @ApiDto(RegisterDto, {
    summary: 'Register an admin user',
  })
  async registerAdmin(@Dto(RegisterDto) dto: RegisterDto) {
    return await this.authService.registerAdmin(dto);
  }

  @Post('/admin/login')
  @ApiDto(LoginDto, {
    summary: 'Login as an admin user',
  })
  async loginAdmin(@Dto(LoginDto) dto: LoginDto) {
    return await this.authService.loginAdmin(dto);
  }
}
