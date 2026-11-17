import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Couple } from '../entities/couple.entity';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { ConnectCoupleDto } from './dto/connect-couple.dto';
export declare class AuthService {
    private userRepository;
    private coupleRepository;
    private jwtService;
    private configService;
    constructor(userRepository: Repository<User>, coupleRepository: Repository<Couple>, jwtService: JwtService, configService: ConfigService);
    getSignupStatus(): Promise<{
        allowSignup: boolean;
    }>;
    signup(dto: SignupDto): Promise<{
        message: string;
        inviteCode: string;
    }>;
    signin(dto: SigninDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            coupleId: string | null;
            inviteCode: string;
        };
    }>;
    connectCouple(user: User, dto: ConnectCoupleDto): Promise<{
        message: string;
        coupleId: string;
    }>;
    withdraw(userId: string): Promise<{
        message: string;
    }>;
    private generateInviteCode;
}
