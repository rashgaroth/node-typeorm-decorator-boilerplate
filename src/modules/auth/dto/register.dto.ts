import { IsNotEmpty, IsOptional } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

@JSONSchema({
  description: 'Registering User',
})
export class RegisterDto {
  // Base
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  email: string | null;

  @IsOptional()
  password: string | null;
}
