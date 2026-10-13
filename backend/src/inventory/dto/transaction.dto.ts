import { IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class PostTransactionDto {
  @IsDateString()
  date: string;

  @IsString()
  itemId: string;

  @IsString()
  @IsOptional()
  batchId?: string;

  @IsString()
  @IsOptional()
  batchNumber?: string;


  @IsString()
  @IsOptional()
  fromLocationId?: string;

  @IsString()
  @IsOptional()
  toLocationId?: string;

  @IsNumber()
  quantity: number;

  @IsString()
  uom: string;

  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @IsString()
  @IsOptional()
  referenceId?: string;

  @IsString()
  createdBy: string;
}
