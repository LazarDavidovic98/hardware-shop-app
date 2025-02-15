import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() // http://localhost:3000/ 
  getIndex(): string {
    return 'Home page';
  }

  @Get('world') // http://localhost:3000/world/
  getWorld(): string {
    return 'World !';
  }

}
