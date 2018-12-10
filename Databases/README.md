-   [Databases](#databases)
    -   [RDS Backups](#rds-backups)
    -   [RDS Automated Backups](#rds-automated-backups)
    -   [RDS Snapshots](#rds-snapshots)
    -   [RDS Restoring Backups](#rds-restoring-backups)
    -   [RDS Encryption](#rds-encryption)
    -   [RDS Multi AZ](#rds-multi-az)
    -   [RDS Read Replica](#rds-read-replica)
-   [DynamoDB](#dynamodb)
-   [Redshift](#redshift)
-   [Elasticache](#elasticache)
-   [Aurora](#aurora)

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

Read Replicas allow you to have a read-only copy of your production database. This is achieved by using Asynchronous replication from the primary RDS instance to the read replica. You use read replicas primarily for very read-heavy database workloads.

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

# DynamoDB

Amazon DynamoDB is a fast and flexible NoSQL database service for all applications that need consistent, single-digit millisecond latency at any scale. It is a fully managed database and supports both document and key-value data models. Its flexible data model and reliable performance make it a great fit for mobile, web, gaming, ad-tech, IoT, and many other applications.

-   stored on SSD storage
-   spread across 3 geographically distinct data centers
-   eventual consistent reads (default)
    -   consistency across all copies of data is usually reached within a second; repeating a read after a short time should return the updated data (best read performance)
-   strong consistent reads
    -   a strong consistent read return a result that reflects all writes that received a successful response prior to the read

## DynamoDB pricing

-   provisioned throughput capacity
    -   write throughput \$0.0065 per hour for every 10 units
    -   read throughput \$0.0065 per hour for every 50 units
    -   each write _unit_ can perform only one write operation per second so if our workload is bigger than that, we need to purchase more of these (the same goes for read _units_ as well)
-   storage costs of \$0.25 per Gb per month
-   DynamoDB is very cheap in terms of read operation but not so much in terms of write operations
-   you can't prerform SQL queries on it
-   ideal for applications that do not need SQL-structured data and are not write-heavy
-   we can also buy a **reserved capacity** by entering into 1-year or 3-year contract with AWS, which will be cheaper
-   we can scale DynamoDB table on the fly, there will be no downtime (compared to RDS)

# Redshift

Amazon Redshift is a fast and powerful, fully managed, petabyte-scale data warehouse service in the cloud. Customers can start small just for $0.25 per hour with no commitment or upfront costs and scale to a petabyte or more for$1000 per terabyte per year, less than a tenth of most other data warehousing solutions.

-   needed for OLAP - online analytic processing
-   data warehousing databases use different type of architecture both from a database perspective and infrastructure layer

## Redshift Configuration

-   single node (160Gb)
-   multi-node

    -   leader node (manages client connections and receives queries)
    -   compute node (store data and perform queries and computations); up to 128 compute nodes

-   **Columnar Data Storage** - Instead of storing data as a series of rows, Amazon Redshift organizes the data by column. Unlike row-based systems, which are ideal for transaction processing, column-based systems are ideal for data warehousing and analytics, where queries often involve aggregates performed over large data sets. Since only the columns involved in the queries are processed and columnar data is stored sequentially on the storage media, column-based systems require far fewer I/Os, greatly improving query performance.

-   **advanced compression** - Columnar data stores can be compressed much more than row-based data stores because similar data is stored squentially on disk. Amazon Redshift employes multiple compression techniques and can often achieve significant compression relative to traditional relational data store. In addition, Amazon Redshift doesn't require indexes or materialized views and so uses less space than traditional relational database systems. When loading data into an empty table, Amazon Redshift automatically samples your data and selects the most appropriate compression scheme.

-   **massively parallel processing (MPP)** - Amazon Redshift automatically distributes data and query load across all nodes. Amazon Redshift makes it easy to add nodes to your data warehousing and enables you to maintain fast query performance as your data warehouse grows.

-   **pricing**

    -   Compute Node Hours (total number of hours you run across all your compute nodes for the billing period. You are billed for 1 unit pre node per hour, so a 3-node data warehouse cluster running persistently for an entire month would incur 2,160 instance hours. You will not be charged for leader node hours; only compute nodes will incur charges)
    -   backup
    -   data transfer (only within a VPC, not outside it)

-   **security**

    -   encrypted in transit using SSL
    -   encrypted at rest using AES-256 encryption
    -   by default Redshift takes care of key management
        -   manage your own keys through HSM
        -   AWS Key Management Service

-   **availability**
    -   currenly only available in 1 AZ
    -   can restore snapshots to new AZ's in the event of an outage

# Elasticache

Elasticache is a web service that makes it easy to deploy, operate, and scale an in-memory cache in the cloud. The service improves the performance of web applications by allowing you to retrieve information from fast, managed, in-memory caches, instead or relying entirely on slower disk-based databases.

Amazon Elasticache can be used to significanly improve latency and throughput for many read-heavy application workloads (such as social networking, gaming, media sharing and Q&A portals) or compute-intensive workloads (such as a recommendation engine)

Caching improves application performance by storing critical pieces of data in memory for low-latency access. Cached information may include the results of I/O-intensive database queries or the results of computationally-intensive calculations.

types:

-   **Memcached** - a widely adopted memory object caching system. ElastiCache is protocol compliant with Memcached, so popular tools that you use today with existing Memcached environments will work seamlessly with the service
-   **Redis** - A popular open-source in-memory key-value store that supports data structures such as sorted sets and lists. ElastiCache supports Master/Slave replication and Multi-AZ which can be used to achieve cross AZ redundancy

# Aurora

Amazon Aurora is a MySQL-compatible, relational database engine that combines the speed and availability of high-end commercial databases with the simplicity and cost-effectiveness of open source databases. Amazon Aurora provides up to five times better performance than MySQL at a price point one tenth of a commercial database while delivering similar performance and availability.

-   starts with 10GB, Scales in 10GB increments to 64TB (storage autoscaling)
-   compute resources can scale up to 32vCPUs and 244GB of memory
-   2 copies of your data is contained in each availability zone, with minimum of 3 availability zones; 6 copies of your data
-   Aurora is designed to transparently handle the loss of up to two copes of data without affecting database write availability and up to three copies without affecting read availability
-   Aurora storage is also self-healing; data blocks and disks are continuously scanned for errors and repaired automatically

## Aurora Replicas

-   2 types of replicas are available
-   Aurora Replicas (currently 15)
-   MySQL Read Replicas (currently 5)
