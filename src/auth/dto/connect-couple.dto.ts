import { IsString, Length } from 'class-validator';

export class ConnectCoupleDto {
  @IsString()
  @Length(6, 6)
  inviteCode: string;
}
