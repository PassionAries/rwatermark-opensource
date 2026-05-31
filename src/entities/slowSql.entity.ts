import { PrimaryGeneratedColumn } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { Entity } from "typeorm/decorator/entity/Entity"


@Entity({name:"slow_sql"})
export class SlowSqlEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;
    @Column({ type: "datetime" ,name:"created_at"})
    createdAt: Date;
    @Column({ type: "text" })
    query: string;
    @Column({ type: "int" ,name:"duration"})
    duration: number;
    @Column({ type: "text" })
    params: string;
}