import { IsString, IsNotEmpty, IsEnum, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EggGrade, EggCondition } from '@prisma/client';

export class EggEntryDto {
  @IsEnum(EggGrade) grade: EggGrade;
  @IsEnum(EggCondition) condition: EggCondition;
  @IsNumber() quantity: number;
}

export class DailyEggCollectionDto {
  @IsString() @IsNotEmpty() flockId: string;
  @IsString() @IsNotEmpty() houseLocationId: string;
  @IsString() @IsNotEmpty() operatorId: string;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EggEntryDto)
  entries: EggEntryDto[];
}
