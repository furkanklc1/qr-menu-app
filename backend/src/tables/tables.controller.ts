import { Controller, Get } from '@nestjs/common';
import { TablesService } from './tables.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Public()
  @Get()
  findAll() {
    return this.tablesService.findAll();
  }
}