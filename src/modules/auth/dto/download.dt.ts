import { IsNotEmpty } from 'class-validator';

export class DownloadDto {
  @IsNotEmpty()
  url: string;
}
