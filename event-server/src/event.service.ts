import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './event.schema';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async createEvent(data: Partial<Event>): Promise<Event> {
    const event = new this.eventModel(data);
    return event.save();
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  async findById(id: string): Promise<Event | null> {
    return this.eventModel.findById(id).exec();
  }

  async updateEvent(id: string, data: Partial<Event>): Promise<Event | null> {
    return this.eventModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }
} 