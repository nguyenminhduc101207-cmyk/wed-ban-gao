import { IsEmail, IsNotEmpty, MinLength, IsOptional, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @MinLength(6, { message: 'Mật khẩu phải có tối thiểu 6 ký tự' })
  password: string;

  @IsNotEmpty({ message: 'Vui lòng nhập họ và tên' })
  fullName: string;

  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại' })
  phone: string;

  @IsOptional()
  address?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
  password: string;
}
