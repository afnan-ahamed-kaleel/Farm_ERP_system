import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { EggGrade } from '@prisma/client';

export class DispatchEggDto {
  @IsString() @IsNotEmpty() customerId: string;
  @IsString() @IsNotEmpty() eggBatchId: string;
  @IsEnum(EggGrade) grade: EggGrade;
  @IsNumber() quantity: number;
  @IsString() @IsOptional() invoiceNumber?: string;
  @IsString() @IsNotEmpty() operatorId: string;
}
