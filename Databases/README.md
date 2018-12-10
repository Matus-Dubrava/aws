-   [Databases](#databases)
    -   [RDS Backups](#rds-backups)
    -   [RDS Automated Backups](#rds-automated-backups)
    -   [RDS Snapshots](#rds-snapshots)
    -   [RDS Restoring Backups](#rds-restoring-backups)
    -   [RDS Encryption](#rds-encryption)
    -   [RDS Multi AZ](#rds-multi-az)
    -   [RDS Read Replica](#rds-read-replica)

# Databases

-   RDS - OLTP (Relational Databases - Online Transaction Processing)
    -   SQL
    -   MySQL
    -   PostgreSQL
    -   Oracle
    -   Aurora (AWS RDS solution)
    -   MariaDB
-   NoSQL
    -   DynamoDB
-   OLAP (Online analytics processing)
    -   RedShift
-   Elasticache - in memory caching
    -   Redis
    -   Memcached

## RDS Backups

-   There are two different types of Backups for AWS: Automated Backups and Database Snapshots.
-   Automated Backups allow you to recover your database to any point in time within a "retention period". The retention period can be between one and 35 days. Automated Backups will take a full daily snapshot and will also store transaction logs throughout the day. When you do a recovery, AWS will first choose the most recent daily back up, and the apply transaction logs relevant to that day. This allows you to do a point in time recovery down to a second, within the retention period.

## RDS Automated Backups

Automated Backups are enabled by default. The backup data is stored in S3 and you get free storage space equal to the size of your database. So if you have an RDS instance of 10Gb, you will get 10Gb worth of storage.

Backups are taken within a defined window. During the backup window, storage I/O may be suspended while your data is being backed up and you may experience elevated latency.

If you delete the original instance of the RDS database, automated backups are deleted as well.

## RDS Snapshots

DB Snapshots are done manually (ie they are user initiated). They are stored even after you delete the original RDS instance, unlike automated backups.

## RDS Restoring Backups

Whenever you restore either an Automatic Backup or a manual Snapshot, the restored version of the databse will be a new RDS instance with a new DNS endpoint.

`original.eu-west-1.rds.amazonaws.com` -> `restored.eu-west-1.rds.amazonaws.com`

## RDS Encryption

Encryption at rest is supported for MySQL, Oracle, SQL Server, PostgreSQL, MariaDB and Aurora. Encryption is done using the AWS Key Management Service (KMS) service. Once your RDS instance is encrypted, the data stored at rest in the underlying storage is encrypted, as are its automated backups, read replicas, and snapshots.

At the present time, encrypting an existing DB instance is not supported. To use Amazon RDS encryption for an existing database, you must first create a snapshot, make a copy of that snapshot and encrypt the copy.

## RDS Multi AZ

Multi-AZ allows you to have an exact copy of your production database in another Availability Zone. AWS handles the replication for you, so when your production database is written to, this write will automatically be synchronized to the stand by database.

In the event of planned database maintenance, DB instance failure, or an Availability Zone failure, Amazon RDS will automatically failover to the standby instance so that database operations can resume quickly without administrative intervention.

**Multi-AZ** is for **disaster recovery only**. It is not used for improving performance. For performance improvements, you need **Read Replicas**.

## RDS Read Replica

Read Replicas allow you to have a read-only copy of your production database. This is achieved by using Asynchronous replication from the primary RDS instance to the read replica. You use read replicas primarily for ver read-heavy database workloads.

-   used for scaling, **not** for disaster recovery
-   must have automatic backups turned on in order to deploy a read replica
-   you can have up to 5 read replica copies of any database
-   you can have read replicas of read replicas (but watch out for latency)
-   each read replica will have its own DNS end point
-   you can have read replicas that have _Multi-AZ_
-   you can create read replicas of _Multi-AZ_ source databases
-   read replicas can be promoted to be their own databases; this breaks the replication
-   you can have a read replica in a second region
-   you can enable encryption of read replica even if the primary database is not encrypted
