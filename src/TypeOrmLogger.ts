// libs/typeorm/src/typeorm-logger.ts
import { DataSource, Logger, QueryRunner } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {  SlowSqlEntity } from './entities/slowSql.entity';

export class TypeOrmLogger implements Logger {
  private slowSqlThreshold: number;
  private dataSource: DataSource | null = null;

  constructor(
    // @InjectRepository(SlowSqlEntity)
    // private slowSqlRepository: Repository<SlowSqlEntity>,
  ) {
    // 慢查询阈值（毫秒），可以从环境变量读取
    this.slowSqlThreshold = parseInt(process.env.SLOW_SQL_TIME || '1000');
  }
   // 设置 DataSource（在 TypeORM 初始化后调用）
  setDataSource(dataSource: DataSource) {
    console.log("dataSource",dataSource)
    this.dataSource = dataSource;
  }

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    // 记录查询（可选）
    console.log(`[TypeORM] Query:: ${query}`);
    if (parameters && parameters.length) {
      console.log(`[TypeORM] Parameters::`, parameters);
    }
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    console.error(`[TypeORM] Query Error: ${error}`);
    console.error(`[TypeORM] Query: ${query}`);
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    console.warn(`[TypeORM] Slow Query (${time}ms): ${query}`);
    
    // 保存慢查询到数据库
    if (time >= this.slowSqlThreshold) {
      this.saveSlowSql(query, time, parameters);
    }
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    console.log(`[TypeORM] Schema: ${message}`);
  }

  logMigration(message: string, queryRunner?: QueryRunner) {
    console.log(`[TypeORM] Migration: ${message}`);
  }

  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
    console.log(`[TypeORM] ${level}: ${message}`);
  }

  private async saveSlowSql(query: string, duration: number, params?: any[]) {
    try {
      await this.dataSource?.getRepository(SlowSqlEntity).save({
        query,
        duration,
        params: JSON.stringify(params || []),
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to save slow SQL:', error);
    }
  }
}