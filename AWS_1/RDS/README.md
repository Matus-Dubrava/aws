-   [RDS](#rds)
    -   [multiAZ](#multiaz)

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
