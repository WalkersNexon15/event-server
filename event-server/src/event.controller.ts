import { Body, Controller, Get, Param, Patch, Post, Request } from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from './event.schema';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) { }

  @Post()
  async create(@Body() dto: Partial<Event>, @Request() req) {
    return this.eventService.createEvent({ ...dto, createdBy: dto.createdBy || req.body.createdBy });
  }

  @Get()
  async findAll() {
    return this.eventService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.eventService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<Event>) {
    return this.eventService.updateEvent(id, dto);
  }
} 