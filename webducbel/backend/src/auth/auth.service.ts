import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { User } from '../database/entities';
import { UserRole } from '../common/enums';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = this.userRepo.create({
      email: dto.email.toLowerCase(),
      fullName: dto.fullName,
      phone: dto.phone,
      address: dto.address,
      role: UserRole.CUSTOMER,
      passwordHash,
    });

    const savedUser = await this.userRepo.save(user);

    const token = await this.generateToken(savedUser);
    return {
      user: this.sanitizeUser(savedUser),
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: dto.email.toLowerCase() })
      .getOne();

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị vô hiệu hóa');
    }

    const token = await this.generateToken(user);
    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy người dùng');
    }
    return this.sanitizeUser(user);
  }

  private async generateToken(user: User): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...safe } = user as any;
    return safe;
  }
}
