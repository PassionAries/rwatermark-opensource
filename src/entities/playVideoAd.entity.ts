import { BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { Entity } from "typeorm/decorator/entity/Entity"


@Entity({name:"play_video_ad"})
export class PlayVideoAdEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;
    @Column({ type: "varchar", length: 255 ,name:"openid"})
    openid: string;
    @Column({ type: "varchar", length: 255 ,name:"date"})
    date:string;
    @Column({ type: "int" ,name:"count",unsigned:true,default:0})
    count:number;
    

    @Column({ type: "varchar", length: 255 ,name:"appid"})
    appid:string;
    @Column({ type: "datetime" ,name:"created_at"})
    createdAt: Date;
    @Column({ type: "datetime" ,name:"updated_at"})
    updatedAt: Date;

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