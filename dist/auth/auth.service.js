"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../entities/user.entity");
const couple_entity_1 = require("../entities/couple.entity");
let AuthService = class AuthService {
    userRepository;
    coupleRepository;
    jwtService;
    constructor(userRepository, coupleRepository, jwtService) {
        this.userRepository = userRepository;
        this.coupleRepository = coupleRepository;
        this.jwtService = jwtService;
    }
    async signup(dto) {
        const { email, password, name } = dto;
        const existing = await this.userRepository.findOne({ where: { email } });
        if (existing) {
            throw new common_1.ConflictException('이미 가입된 이메일입니다.');
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
    async signin(dto) {
        const { email, password } = dto;
        const user = await this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'name', 'inviteCode'],
            relations: ['couple'],
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new common_1.UnauthorizedException('로그인 정보가 올바르지 않습니다.');
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
    async connectCouple(user, dto) {
        const partner = await this.userRepository.findOne({
            where: { inviteCode: dto.inviteCode },
            relations: ['couple'],
        });
        if (!partner) {
            throw new common_1.NotFoundException('초대 코드가 유효하지 않습니다.');
        }
        if (partner.id === user.id) {
            throw new common_1.BadRequestException('자기 자신과는 커플이 될 수 없습니다.');
        }
        if (partner.couple || user.couple) {
            throw new common_1.BadRequestException('이미 커플이 연결된 상태입니다.');
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
    async withdraw(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['couple', 'couple.members'],
        });
        if (!user) {
            throw new common_1.NotFoundException('사용자를 찾을 수 없습니다.');
        }
        if (user.couple) {
            await this.coupleRepository.softDelete(user.couple.id);
        }
        await this.userRepository.softDelete(userId);
        return { message: '회원 탈퇴가 완료되었습니다.' };
    }
    generateInviteCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(couple_entity_1.Couple)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map