import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { AiModule } from './services/ai/ai.module';
import { EnrichmentModule } from './services/enrichment/enrichment.module';
import { NotificationsModule } from './services/notifications/notifications.module';
import { RenderModule } from './services/render/render.module';
import { DatabaseModule } from './database/database.module';
import { Neo4jModule } from './database/neo4j/neo4j.module';

@Module({
  imports: [
    // Config available everywhere — no need to import per-module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // Infrastructure
    DatabaseModule,
    Neo4jModule,

    // Services
    RenderModule,
    AiModule,
    EnrichmentModule,
    NotificationsModule,

    // Feature modules
    WorkflowsModule,
  ],
})
export class AppModule {}
