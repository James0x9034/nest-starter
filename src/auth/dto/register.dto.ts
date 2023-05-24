import { IsEmail, IsString, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/, {
    message: 'Invalid password, at least one number, one upper case letter',
  })
  password: string;
}
