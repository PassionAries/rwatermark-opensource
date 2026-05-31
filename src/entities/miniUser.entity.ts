import { BeforeInsert, BeforeUpdate, Entity } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";

/** 会员表 */
@Entity({ name: "mini_user" })
export class MiniUserEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column({ type: "varchar", length: 255, name: "openid" })
  openid: string;
  @Column({ type: "varchar", length: 255, name: "appid" })
  appid: string;
  @Column({ type: "varchar", length: 255, name: "unionid" })
  unionid: string;
  @Column({ type: "varchar", length: 255, name: "session_key" })
  sessionKey: string;
  @Column({ type: "varchar", length: 255, name: "nickname" })
  nickname: string;
  @Column({ type: "varchar", length: 255, name: "avatar" })
  avatar: string;
  @Column({ type: "varchar", length: 255, name: "gender" })
  gender: string;
  @Column({ type: "int", name: "grade", unsigned: true })
  grade: number;
  @Column({ type: "datetime", name: "created_at" })
  createdAt: Date;
  @Column({ type: "datetime", name: "updated_at" })
  updatedAt: Date;
  @Column({ type: "datetime", name: "last_login_at" })
  lastLoginAt: Date;
  @Column({ type: "int", name: "view_count", unsigned: true, default: 1 })
  viewCount: number;
  @Column({ type: "int", name: "balance", unsigned: true, default: 0 })
  balance: number;
  @Column({ type: "varchar", length: 16, name: "invite_code", nullable: true, unique: true })
  inviteCode: string | null; // 邀请码，用于分享链接

  @BeforeInsert()
  beforeInsert() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = new Date();
  }
}

/*
-- 新增邀请码字段（已有表时执行）
ALTER TABLE `mini_user` ADD COLUMN `invite_code` varchar(16) DEFAULT NULL COMMENT '邀请码' AFTER `balance`;
CREATE UNIQUE INDEX `uk_invite_code` ON `mini_user` (`invite_code`);
*/ 