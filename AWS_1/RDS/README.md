-   [RDS](#rds)
    -   [multiAZ](#multiaz)
    -   [backups](#backups)
    -   [subnet groups](#subnet-groups)
    -   [security](#security)
    -   [purchasing](#purchasing)
    -   [read replicas](#read-replicas)
    -   [scaling](#scaling)

# RDS

-   is a fully managed relational DB engine service where AWS is responsible for

    -   security and pathing of the DB instances
    -   automated backups for your DB instances (default setting)
    -   software updates for the DB engine
    -   easy scaling for storage and compute as required
    -   is selected, multi-AZ with synchronous replication between the active and standby DB instances
    -   automatic failover if Multi-AZ option was selected
    -   provides the ability to create read replicas for DB read scaling

-   every DB instance has a weekly maintenance window

    -   if you did not specify one at the time you create the DB instance, AWS will choose one randomly for you (30 min. long)

-   **AWS is not responsible for**

    -   managing DB settings
    -   building a relational DB schema
    -   DB performance tunning

-   supported RDBs

    -   MY SQL Server
    -   ORACLE
    -   PostgreSQL
    -   MariaDB
    -   AWS Aurora
    -   MySQL

-   **two licencing models**

    -   bring your own licence (BYOL)
    -   licence included

-   **limits**

    -   up to 40 DB instances per account
        -   10 of this 40 can be ORACLE or MS SQL server under _licence included_ model
        -   under BYOL model, all 40 can be any DB engine you need

-   Amazon RDS use EBS volumes (not instance-store) for DB and logs storage

-   general puprpose RDS storage
    -   use for DB workloads with moderate I/O requirements
-   provisioned IOPS RDS storage
    -   use for high performance OLTP workloads
-   magnetic RDS storage

    -   use for small DB workloads

-   **up to 4TB for MS SQL Server**
-   **up to 6TB for the rest of supported RDS DB Engines**

## multiAZ

-   you can select the multi-AZ option during RDS DB instance lauch
-   EDS service creates a standby instance in a different AZ in the same region, and configures **SYNCHRONOUS** replication between the primary and standby
-   you can **NOT** read/write to the standby RDS DB instance
-   you can **NOT** dictate/select which AZ in the region will be chosen to create the standby DB instance

    -   you can, however, view which AZ is seleceted after the standby is created

-   depending on the instance class it may take 1 to few minutes to failover to the standby instance
    -   recommended is to implement DB connection retries into your application, to account for this few minutes required for failover
-   AWS recommends the use of provisioned IOPS isntances for multi-AZ RDS instances

-   failover may be triggered when

    -   loss of primary AZ or primary DB instance failure
    -   loss of network connectivity to primary
    -   compute (EC2) unit failure on primary
    -   storage (EBS) unit failure on primary
    -   the primary DB instance changed
    -   pathing the OS of the DB instance

    -   manual failover (reboot with failover on primary)

-   during failover, the CNAME of the RDS DB instance is updated to map to the standby IP address
    -   this is why it is recommended to use the endpoint to reference your DB instances and not its IP address
-   the CNAME does not change, because the RDS endpoint does not change

-   RDS enpoint does not change by selecting multi-AZ option, however the primary and standby instance will have different IP addresses, given they are in different AZs

    -   hence, it is always recommended that you do not use the IP address to point your multi-AZ RDS instance, rather use the enpoint
        -   this is very helpful in a failover scenario, since the primary will fail to the standby, ie. IP address of RDS instance will change
            -   referencing by endpoint means, there is no change (endpoint wise) when a failover happens, so no diruption or manual intervention facilitate RDS DB isntance access in a failover scenario

-   in multi-AZ deployment, you can only initiate a manual RDS DB instance failover (primary to secondary) when rebooting

    -   this is by selecting the _reboot with failover_ reboot option on the primary RDS DB instance

-   a DB instance reboot is required for changes to take effect when you change the DB parameter group, or when you change a static DB parameter

    -   this reboot restarts the DB engine
    -   the DB parameter group: is a configuration container for the DB engine configuration

-   the following procedures are done one standby first, then on primary

    -   os patching
    -   system upgrades
    -   DS scaling

-   in multi-AZ snapshots and automated backups are done on standby instance to avoid I/O suspension an primary instance

-   the sequence is done as follows

    -   maintenance on standby is performed
    -   standy promoted to primary
    -   maintenance performed on old primary (current standby)

-   you can manually upgrade a DB instance to a supported DB engine version from AWS console as follows

    -   RDS -> DB instance -> modify DB instance -> set DB engine version
        -   by default, changes will take effect during the next maintenance window
        -   or, you can force an immediate ugrade if you need to
        -   in multi-AZ deployments
            -   version upgrade will be conducted on both primary and standby at the same time, which will cause an outage (unavailability of both)
            -   advised to do it during change/maintenance windows

-   in multi-AZ scenario
    -   make sure that your security groups and NACLs will allow your APP servers to communicate with both the primary and standby instances
        -   in case of a failover the standby becomes primary

### Event notification

-   you will be alerted by a DB instance event when failover occurs

-   AWS RDS uses AWS SNS to send RDS events via SNS notifications
    -   you can use API calls to the AWS RDS service to list the RDS events in the past 14 days (_DescribeEvents API_)
    -   you can view past 14 days events using CLI
    -   using **AWS console, you can only view RDS events for the last 1 day (24 hours)**

## backups

-   there are the two methods to backup and restore your RDS DB instances

    -   AWS RDS automated backups
    -   user initiated manual backups

-   either on backs up the entire DB instance and not just the individual DBs
-   either one creates a storage volume snapshot of your entire DB instance
    -   not just the individual database
-   you can make copies of automated backups and of manual backups

### automated backups

-   automated backups by AWS, back up your DB data to multiple AZs to provide for data durability
-   are labeled automated in AWS console (easili distinguishable)
-   stored in S3
-   multi-AZ automated backups will be taken from the standby instance not the primary
-   the DB instance must by in _Active_ state for the automated backups to happen

    -   if in any other state, like _Storage full_ state, the automated backups will not happen

-   automated backups (not the manual ones) are used for point-in-time DB instance recovery
-   it can restore the DB up to 5 minutes in time, using the DB transaction logs and the automated snapshot
-   RDS automatically backs up the DB instance **daily**, by creating a storage volume snapshot of your DB instance (full daily snaphost), including **the DB transaction logs (modifications)**, which are critical to be able to restore up to last 5 minutes in time

    -   you can choose when during the day this is done (backup window)
    -   no additional charge for RDS backing up your DB instance
    -   enabled by default, you can disable it by setting retention period to zero

-   during the daily backup window, your I/O may be suspended (for standalone RDS deployments)
-   for multi-AZ deployment, backups are taken from the standby DB instance (true for MariaDB, MySQL, ORACLE, PostgreSQL)
-   automated backups are deleted when you delete your RDS DB instance
-   an outage occurs if you change the backup retention period from zero to non-zero value or the other way around
-   automated backups are currenly supported only of InnoDB storage engine for MySQL (and not for myISAM engine)

    -   use of automated backups with other MySQL DB storage engines, including ISAM, may lead to unpredictable behavior during restoration

-   you can not share automated backups with other accounts

    -   manual backups can be shared
    -   if you need to share automated backup with other accounts, first, make a copy of it, that copy will be considered as a manual backup which you can share

### retention period

-   the period of time AWS keeps the automated backups before deleting them
-   by default
    -   7 days if configured from the AWS console for all DB engines (except Aurora, default is one day regardless how it was configured)
    -   one day if configured from API or CLI (for all DB engines including Aurora)
-   you can increase it up to 35 days
-   a value of zero (0) disables automatic backups completely
-   a DB outage happens if you change your retention period from zero to non-zero value or the other way around, from non-zero to zero value

### manual snapshots

-   are not used for point-in-time recovery
-   are user initiated, not RDS service initiated
-   stored in amazon S3
-   they are not deleted automatically when you delete your RDS instance, rather, they will stay on S3 until you go ahead an delete them
-   it is recommended to take a final snapshot before deleting your RDS DB instance
    -   it comes in handy if you want to restore your DB instance in the future
-   can be shared with other AWS accounts directly

### restoring from snapshot

-   you can specify a point-in-time restore to any given second during the retention period
-   when you initiate a point-in-time recovery, transaction logs are applied to the most appropriate daily backup to restore your DB to that point-in-time
-   when you restore a DB instance, only the **default** DB parameters and security groups are associated with the restored instance

    -   once the restore is complete, you need to associate/apply the customer DB parameters and security group settings

-   you can **NOT** restore from a DB snapshot into an existing DB instance, rather it has to create a new DB instance
    -   the new DB instance will have a new endpoint
-   **restoring from a backup or a DB snapshot changes the RDS instance endpoint**
-   a new DB instance will be created when you perform a restore
    -   this new DB instance will have a new EDS endpoint
-   you can change the storage type (magnetic, provisioned IOPS, general purpose) during a restore process

## subnet groups

-   is a collection of subnets in a VPC that you want to allocate for DB isntance launched in the VPC
-   each DB subnet must have at least one subnet in each AZ in a region
-   even if you are starting with a standalone RDS instance, configure the subnet group with a subnet in each AZ in the region
    -   this will facilitate launching your standby instance in the subnet group when you opt for the multi-AZ deployment
-   during the creation of your RDS instance you can select a preferred AZ, and specify which subnet group, and subnet of that group, for your RDS DB instance
    -   then RDS service will allocate an IP address in that subnet to your RDS instance
    -   and then RDS service will create an ENI, attach it to the RDS instance, and assign the above IP address to it

## security

-   you can **NOT** encrypt an existing un-encrypted DB instance
-   to do that, you need to

    -   create a new, encrypted instance and migrate your data to it (from the un-encrypted to encrypted)
    -   or, restore from a backup/snapshot into a new encrypted RDS instance

-   RDS supports SSL encryption for communication between the App instances and the RDS DB instances

    -   RDS generates a certificate for the instance which is used to encrypt this communication
    -   RDS service supports **encryption at rest** for all DB engines using AWS KMS

-   for an encrypted at rest DB instance
    -   all its snaphosts
    -   backups
    -   data at storage (on the DB instance)
    -   read replicas created from the DB isntance
    -   **are all encrypted as well**
    -   encryption and decryption is handled transparently

### security best practices

-   use AWS IAM accounts to control access to RDS API actions
-   assign an individual IAM account to each person who manages RDS resources
-   grant the least permissions required by each user to perform the assigned duties
-   use IAM groups to manage/grant permissions to multiple users at one time
-   rotate your IAM credentials regularly

## purchasing

-   no upfront costs
-   you pay for

    -   DB instance hourds (partial hours charged as full hours)
    -   storage GB/mo.
    -   I/O requests/mo. - for magnetic RDS storage instance only
    -   provisioned IOPS/mo. - for RDS provisioned IOPS SSD instance
    -   internet data transfer
    -   backup storage (DB backups, and active manual backups)
        -   this increases by increasing DB backup retention period
        -   backup storage for automated RDS backups (not the manual snapshots) up to the provisioned RDS instance's EBS volume size (EBS volume) is free of charge

-   the DB storage provisioned to your DB instance is in a single AWS AZ

    -   since AWS backups your DB to multiple AZs for data durability
        -   AWS charges for the database storage above the free allocated DB storage for your instance
        -   free automated backup storage provided to the client/account is in a single AZ

-   AWS will charge for the following (in addition to the single AZ DB instance charges)
    -   multi-AZ DB hours
    -   provisioned storage (multi-AZ)
    -   double write I/O (writing to the primary and replication from primary to standby)
    -   you are not charged for DB data transfer during replication from primary to standby
    -   your DB storage does not change between standalne and multi-AZ deployments (same DB and same AWS storage volume for that DB in multiple AZs for durability)

### reserved instances

-   similar to EC2 reserved instances
-   DB RIDs are _region_ specific, **NOT** AZ specific
-   one or three year term option
-   each reservation must be specific in

    -   DB engine
    -   DB instance class
    -   multi-AZ option
    -   licence model
    -   region
        -   for RDS RI pricing to apply, an exact RDS instance must be create on-demand, exact on all above (DB engine, instance class, multi AZ option, licence model, **and** region)

-   you can **NOT** move RDS RQs between regions
-   you can move RDS RIs between AZs in the same region
-   you can **NOT** cancel an RDS RI's reservation

## read replicas

-   when the required read I/O capacity is reached but still more I/O capacity is required for heave/intensive read applications, read replicas can come in handy
-   read replica is replica of the primary RDS DB instance, but they can only be used for read actions
-   primary DB instance becomes the source of the replication to this read replica

    -   the data is first written to the source/primary DB instance, then using **asynchronous replication**, it gest replicated to the read replica
        -   ie. there is a time lag between when the data is written to the primary and when it gets replicated to the read replica

-   multi-AZ with read replicas can be combined in one deployment
    -   however, it is **not** possible to create Multi-AZ for your read replicas (ie. created standby read replica DB instances for your read replica instances)
-   read replicas can be created from the console or API
-   **automated backups (retention period non zero) must be enabled and remain enabled for read replicas to work**
-   it is supported with transactional DB storage engines, and are supported on InnoDB engines, not MyISAM (MyMAPo)

    -   MySQL
    -   MariaDB
    -   PostgreSQL
        -   each of these DB engines support up to 5 read replicas per source/primary DB

-   up to 15 read replicas can be distributed across the AZs that a DB cluster spans within a region for **Aurora DB**

### use cases

-   shifting read intensice applications such as business reporting, or data warehousing to read from read replicas as opposed to overload the primary DB
-   scaling beyond the I/O capacity of your main DB instance for read-heavy workloads
-   service read traffic while the source is unavailable

### creating read replicas

-   it can be done from API or AWS console
-   the AZ where you want to read replica to be can be specified
-   the read replica's storage type or instance class can be different from the source DB instance

    -   you can scale up your read replica, but you can **not** scale it down
    -   DB engine type can **not** be changed though, it is inherited from the source (primary) DB instance
    -   connecting to the DB engine on the read replica is possible, the same way (DB console) you connect to the primary DB instance
    -   if you scale the source DB instance, you should also scale the read replicas

-   you can **not** have more than four instances involved in a replication chain
-   if the source instance of a multi-AZ deployment fails over to the secondary, any associated read replicas are swithed to use the secondary as their replication source
-   you must explicitly delete read replicas, using the same mechanisms for deleting a DB instance
    -   if you delete the source DB instance without deleting the replicas, each replica is promoted to a stand-alone, single-AZ DB instance
-   if you promote a MySQL or MariaDB read replica that is in turn replicating to other read replicas, those read replicas remain active (replication chain)
-   if replication is stopped for more than 30 consecutive days, either manually or due to a replication error, Amazon RDS terminates replication between the master DB instance and all read replicas

### cross region read replicas

-   you can create read replicas in another region from MySQL, MariaDB, PostgreSQL (but not for Aurora DB)
    -   uses asynchronous replication
    -   this can be used in improving DB capabilities by providing a lower RPO in case of regional failure
        -   it can also help in case you have a requirement of analytics to run in a different region (B) for a DB in region A

### promoting read replicas to standalone DB instances

-   you can promote a read replica into a standalone/single AZ DB instance
-   promotion process takes several minutes because the DB will reboot before the promoted replica becomes available as a standalone DB instance (allow for read/write, snaphosts/backups etc)
-   the promoted replica into a standalone DB instance will retain

    -   backup retention period
    -   backup window
    -   DB parameter group

-   in case of multiple read replicas (MySQL, MariaDB), promoting one to a standalone DB instance does not affect the other read replicas, those will continue to read from the former primary (source DB instance)

## scaling

-   you can scale an RDS storage up only, you can not decrease or scale down the storage size
    -   you can **NOT** decrease the allocated storage for an RDS instance
-   you can scale storage and also change storage type for all supported DB engines, execpt MS SQL server

-   you can scale (up only, not down) the compute and storage capacity of your existing EDS DB instances

-   **scaling storage** can happen while the RDS instance is still running, available/accessible
    -   this may cause some performance degradations during the change, but will result in enhanced I/O after
-   **scaling compute** will cause a downtime to your DB instance
-   you do the required scaling changes, then you can

    -   immediately have the changes take effect
    -   or, leave it to the default, which will make the changes take effect during the maintenance window

-   you can **NOT** change the storage capacity, nor type of storage of the MS SQL Server on window-based RDS instances
    -   this is due to extensibility limitations of striped storage attached to windows server
-   to work around the above, you can take a snapshot, use it to start a new DB instance with the desired storage type and capacity (must be an increase, not decrease)

    -   note that a new instance, will have a **new RDS endpoint**

-   if you hit the largest RDS DB instance, and you still need to scale, you can
    -   use partitioning and split your RDS DB over multiple RDS instances
