import { IsString, IsInt, IsDateString, Min, IsOptional } from 'class-validator';

export class CreateMortalityDto {
  @IsString()
  flockId: string;

  @IsString()
  locationId: string;

  @IsInt()
  @Min(0)
  mortalityCount: number;

  @IsInt()
  @Min(0)
  cullingCount: number;

  @IsString()
  cause: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsDateString()
  date: string;

  @IsString()
  operatorId: string;
}
