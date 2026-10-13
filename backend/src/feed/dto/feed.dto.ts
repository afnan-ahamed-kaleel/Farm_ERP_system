import { IsString, IsNotEmpty, IsEnum, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FormulaStage } from '@prisma/client';

export class IngredientDto {
  @IsString() @IsNotEmpty() rawMaterialItemId: string;
  @IsNumber() inclusionKg: number;
}

export class CreateFormulaDto {
  @IsString() @IsNotEmpty() code: string;
  @IsString() @IsNotEmpty() name: string;
  @IsEnum(FormulaStage) targetStage: FormulaStage;
  @IsNumber() baseQuantityKg: number;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients: IngredientDto[];
}

export class CreateProductionDto {
  @IsString() @IsNotEmpty() formulaVersionId: string;
  @IsNumber() targetQuantityKg: number;
  @IsString() @IsNotEmpty() operatorId: string;
}

export class IssueFeedDto {
  @IsString() @IsNotEmpty() feedBatchId: string;
  @IsString() @IsNotEmpty() targetHouseId: string;
  @IsNumber() quantityKg: number;
  @IsString() @IsNotEmpty() operatorId: string;
}

export class ConsumeFeedDto {
  @IsString() @IsNotEmpty() flockId: string;
  @IsString() @IsNotEmpty() houseLocationId: string;
  @IsString() @IsNotEmpty() feedBatchId: string;
  @IsNumber() quantityConsumedKg: number;
  @IsString() @IsNotEmpty() operatorId: string;
}
