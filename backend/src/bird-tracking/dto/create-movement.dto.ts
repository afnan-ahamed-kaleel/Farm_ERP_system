import { IsString, IsInt, IsDateString, Min, IsNotEmpty } from 'class-validator';

export class CreateMovementDto {
  @IsString()
  @IsNotEmpty()
  flockId: string;

  @IsString()
  @IsNotEmpty()
  sourceLocationId: string;

  @IsString()
  @IsNotEmpty()
  targetLocationId: string;

  @IsString()
  @IsNotEmpty()
  pathway: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  createdBy: string;
}
