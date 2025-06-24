import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment content',
    example: 'This task is completed and ready for review',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
