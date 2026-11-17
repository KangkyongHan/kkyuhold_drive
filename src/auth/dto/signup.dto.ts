import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: '비밀번호는 대문자, 소문자, 숫자 또는 특수문자를 포함해야 합니다.',
  })
  password: string;

  @IsString()
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다.' })
  name: string;
}
