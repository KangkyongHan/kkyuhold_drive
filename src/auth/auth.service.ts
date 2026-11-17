import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Couple } from '../entities/couple.entity';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { ConnectCoupleDto } from './dto/connect-couple.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Couple)
    private coupleRepository: Repository<Couple>,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const { email, password, name } = dto;

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const inviteCode = this.generateInviteCode();

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      inviteCode,
    });

    await this.userRepository.save(user);
    return { message: '회원가입이 완료되었습니다.', inviteCode };
  }

  async signin(dto: SigninDto) {
    const { email, password } = dto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'inviteCode'],
      relations: ['couple'],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('로그인 정보가 올바르지 않습니다.');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        coupleId: user.couple?.id || null,
        inviteCode: user.inviteCode,
      },
    };
  }

  async connectCouple(user: User, dto: ConnectCoupleDto) {
    const partner = await this.userRepository.findOne({
      where: { inviteCode: dto.inviteCode },
      relations: ['couple'],
    });

    if (!partner) {
      throw new NotFoundException('초대 코드가 유효하지 않습니다.');
    }

    if (partner.id === user.id) {
      throw new BadRequestException('자기 자신과는 커플이 될 수 없습니다.');
    }

    if (partner.couple || user.couple) {
      throw new BadRequestException('이미 커플이 연결된 상태입니다.');
    }

    const couple = this.coupleRepository.create({
      name: `${user.name} & ${partner.name}의 공간`,
    });
    await this.coupleRepository.save(couple);

    user.couple = couple;
    partner.couple = couple;

    await this.userRepository.save([user, partner]);

    return { message: '커플 연결이 완료되었습니다.', coupleId: couple.id };
  }

  async withdraw(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['couple', 'couple.members'],
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 커플 연결이 되어 있다면 커플 정보도 정리 (Soft Delete)
    if (user.couple) {
      await this.coupleRepository.softDelete(user.couple.id);
    }

    await this.userRepository.softDelete(userId);
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }

  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
