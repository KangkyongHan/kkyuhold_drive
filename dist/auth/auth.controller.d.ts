import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { ConnectCoupleDto } from './dto/connect-couple.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getSignupStatus(): Promise<{
        allowSignup: boolean;
    }>;
    signup(signupDto: SignupDto): Promise<{
        message: string;
        inviteCode: string;
    }>;
    signin(signinDto: SigninDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            coupleId: string | null;
            inviteCode: string;
        };
    }>;
    connect(req: any, connectDto: ConnectCoupleDto): Promise<{
        message: string;
        coupleId: string;
    }>;
    getMe(req: any): {
        id: any;
        email: any;
        name: any;
        couple: {
            id: any;
            name: any;
        } | null;
        inviteCode: any;
    };
}
