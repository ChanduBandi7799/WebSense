import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  getInfo() {
    return {
      message: 'WebSense Dashboard working ✅',
    };
  }
}
