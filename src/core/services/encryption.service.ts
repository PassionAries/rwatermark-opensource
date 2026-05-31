import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from 'src/config';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly ivLength = 16; // AES 块大小

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('encryption.secretKey');
    if (!secretKey) {
      throw new Error('encryption.secretKey is not configured in conf-json/rwatermark-server.json');
    }
    this.key = crypto.createHash('sha256').update(secretKey).digest();
  }

  /**
   * 加密数据
   * @param text 要加密的文本
   * @returns 加密后的字符串（格式：iv:encryptedData）
   */
  encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // 返回 iv 和加密数据的组合，用冒号分隔
      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error(`加密失败: ${error.message}`);
    }
  }

  /**
   * 解密数据
   * @param encryptedText 加密的文本（格式：iv:encryptedData）
   * @returns 解密后的字符串
   */
  decrypt(encryptedText: string): string {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 2) {
        throw new Error('无效的加密数据格式');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`解密失败: ${error.message}`);
    }
  }

  /**
   * 加密对象（先序列化为 JSON）
   */
  encryptObject(obj: any): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  /**
   * 解密对象（解密后反序列化为对象）
   */
  decryptObject<T = any>(encryptedText: string): T {
    const decrypted = this.decrypt(encryptedText);
    return JSON.parse(decrypted);
  }
}