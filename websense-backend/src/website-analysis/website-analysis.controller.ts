import { Body, Controller, Post } from '@nestjs/common';
import { WebsiteAnalysisService } from './website-analysis.service';

@Controller('website-analysis')
export class WebsiteAnalysisController {
  constructor(private readonly service: WebsiteAnalysisService) {}

  @Post('analyze')
  async analyzeWebsite(@Body() data: { url: string }) {
    return this.service.runLighthouseAnalysis(data.url);
  }
  
  @Post('analyze-pagespeed')
  async analyzeWebsiteWithPageSpeed(@Body() data: { url: string, apiKey?: string }) {
    return this.service.runPageSpeedAnalysis(data.url, data.apiKey);
  }

  @Post('analyze-security')
  async analyzeWebsiteSecurity(@Body() data: { url: string }) {
    return this.service.runSecurityAnalysis(data.url);
  }

  @Post('analyze-seo')
  async analyzeWebsiteSEO(@Body() data: { url: string }) {
    return this.service.runAdvancedSEOAnalysis(data.url);
  }

  @Post('analyze-tech-stack')
  async analyzeWebsiteTechStack(@Body() data: { url: string }) {
    return this.service.runTechStackAnalysis(data.url);
  }
}