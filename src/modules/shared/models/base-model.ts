import { BaseEntity, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseModel extends BaseEntity{
    @PrimaryGeneratedColumn("uuid")
    public id?: string;

    @CreateDateColumn({name:'created_date'})
    public createdDate:Date;

    @UpdateDateColumn({name:'modified_date'})
    public modifiedDate:Date;

    @Column('varchar',{
        name:'created_by',length: '255',
    nullable: true})
    public createdBy:string;
}
