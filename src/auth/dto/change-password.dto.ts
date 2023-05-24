import { IsEmail, IsString, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/, {
    message: 'Invalid password, at least one number, one upper case letter',
  })
  password: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/, {
    message: 'Invalid password, at least one number, one upper case letter',
  })
  newPassword: string;
}
