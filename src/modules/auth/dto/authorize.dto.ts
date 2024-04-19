import { IsNotEmpty, IsOptional } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

@JSONSchema({
  description: 'Authorize User',
})
export class AuthorizeDto {
  // Base
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  email: string | null;

  @IsNotEmpty()
  provider: string;

  @IsOptional()
  picture: string | null;

  // Account
  @IsOptional()
  password: string | null;

  @IsOptional()
  emailVerified: boolean | null;

  @IsOptional()
  expiresAt: number | null;

  @IsOptional()
  providerAccountId: string | null;

  @IsOptional()
  refreshToken: string | null;

  @IsOptional()
  accessToken: string | null;

  @IsOptional()
  tokenType: string | null;

  @IsOptional()
  scope: string | null;

  @IsOptional()
  idToken: string | null;
}
