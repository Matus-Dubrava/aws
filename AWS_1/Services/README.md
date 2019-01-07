-   [Elasticache](#elasticache)
    -   [caching strategies](#caching-strategies)
    -   [Memcached](#memcached)
    -   [Redis](#redis)
-   [Redshift](#redshift)
    -   [data security](#data-security)
    -   [performance](#performance)
    -   [backups](#backups)
    -   [availability and durability](#availability-and-durability)
    -   [billing](#billing)
-   [Kinesis](#kinesis)
    -   [Kinesis Streams](#kinesis-streams)
    -   [Kinesis Firehose](#kinesis-firehose)
    -   [Kinesis Analytics](#kinesis-analytics)
-   [SQS](#sqs)
    -   [polling](#polling)
    -   [retention period](#retention-period)
    -   [visibility timeout](#visibility-timeout)
    -   [reliability and security](#reliabilit-and-security)
    -   [limits and logging](#limits-and-logging)
-   [DynamoDB](#dynamodb)
    -   [tables](#tables)

# Elasticache

**in-memory data storage**

-   the primary purpose of an in-memory key-value store is to provide ultra-fast (sub-milliseconds latency) and inexpensive access to copies of data
-   most data stores have areas of data that are frequently accessed but seldom updated
-   additionally, quering a database will always be slower and more expensive than locating a key in key-value pair cache

**elasticache**

-   is an AWS fully managed web service
-   it is an in-memory key value data store engine it the cloud

    -   it improves the performance of web applications by allowing for the retrieval of information from fast, managed, in-memory system (instead of reading from the DB itself)
    -   improves response times for user transactions and queries
    -   can enhance response time for read-intensive and/or compute-intensice workloads
        -   examples: social networking, gaming, media sharing, Q&A portals

-   it offloads the read workload from the main DB instance (less I/O load on the DB)
-   it does this by storing the results of frequently accessed pieces of data (or computationally intensive calculations) in-memory
-   integrates with CloudWatch
-   deployed using EC2 instances
-   Elasticache EC2 nodes deployed can not be accessed from the Internet. nor can they be accessed by EC2 instances in other VPCs
-   can be on-demand or reserved instances too (NOT spot instances)
-   access to Elasticache is controlled by VPC security groups and subnet groups
-   you need to configure VPC subnet groups for Elasticache (VPC that hosts EC2 instance and the Elasticache cluster)

    -   changing the subnet group of an existing Elasticache cluster is not currenly supported

-   if an Elasticache node fails, it is automatically replaced by AWS Elasticache (fully managed service)
-   Elasticache nodes are launched in clusters, and can span more than one subnet of the same subnet group which was associated with the cluster when creating it
-   your application connects to your cluster using endpoints
    -   an endpoint is a node or cluster's unique address (use these endpoints rather than the IP addresses in your application)
-   a cluster can have one or more nodes included within

-   supports two caching engines

    -   **Memcached** (is not a data store [DB], only a cache)
    -   **Redis** - is the fastest NoSQL - can be used as a DB (data store)

-   a cluster is a collection of one or more nodes using the same caching engine (Memcached or Redis)
-   a cluster can be as small as one node

## caching strategies

-   there are different strategies that can be used to populate the cache
-   the strategy you want to implement for populating and maintaing your cache depends upon what data you are caching and the access patterns to that data
-   common cache maintenance strategies (loading data into your cache)

    -   lazy loading
    -   write through
    -   adding TTL

-   each strategy has its own advantages and disadvantages

## Memcached

-   is not persistent
    -   can not be used as a data store
    -   if the node fails, the cached data (in the node) is lost
-   ideal front-end for data stores (RDS, DynamoDB ...etc)
-   use cases
    -   cache contents of a DB
    -   cache data from dynamically generated webpage
    -   transient session data
    -   high frequency counters for admission control in high volume web apps
-   max 100 nodes per region, 1-20 nodes per cluster (soft limit)

-   can integrate with SNS for node failure/recovery notification
-   supports auto discovery for nodes added/removed from the memcached cluster
    -   can be used by applications to update node membership
-   scale out/in (horizontally) by adding/removing cluster nodes
-   scales up/down (vertically) by changing node family/type

    -   since it is not persistent, scaling up/down invovles creating a new cluster
        -   the new cluster starts empty without data unless your application populates it

-   **does not support multi-AZ failover, replication, NOR does it support snapshots for backup/restore**

    -   node failure means data loss

-   you can however, place your Memcached nodes in different AZs to minimuze the impact of an AZ failure and to contain the data loss in such an incident
    -   you can horizontally partition your data across those nodes

## Redis

-   it is persistent, using the snapshot feature

    -   ie. it can be used as a data store (instead of RDS for instance), not just a cache like memcached
    -   at any time, you can restore your data by creating a new Redis cluster and populating it with data from a backup

-   use cases: Web, Mobile Apps, Healthcare Apps, Finacial Apps, Gaming, Ad-Tech, and IoT
-   supports Redis master/slave replication
-   supports snapshots (automatic and manual) to S3

    -   the backup can be used to restore a cluster or to seed a new cluster
    -   the backup includes cluster metadata and all data in the cluster

-   during the backup process you cannot perform any additional API or CLI operations on the cluster
-   you can manage the snapshots (backups) through AWS console or Elasticache API

    -   automatic snapshots are deleted with the Redis deletion

-   you can copy your snapshots to other AWS regions (indirectly though)

    -   you do this by
        -   first exporting the snapshot from Elasticache to an S3 bucket in the same region
        -   then you copy the exported copy of the snaphost to the destination region
        -   this can be handy if you want to seed a new cluster in the other region, rather than waiting to populate a new cluster from the other region's database

-   multi-AZ is done by creating read replica(s) in another AZ in the same region
-   **clustering mode disabled** - your Redis cluster can have only one shard
    -   one shard can have one read/write primary node and 0-5 read only replicas
    -   you can distribute the replicas over multiple AZs in the same region
    -   replication from the primary node to the read replica is asynchronous
    -   applications can read from any node in the cluster, but can write to the primary node only
-   **clustering mode enabled** - your Redis cluster can have up to 15 shards

    -   with the data partitioned across the shards
    -   each shard has one primary node and 0-5 read only nodes

-   snapshots can slow down your nodes, better take snapshots from the read replicas

-   in multi-AZ with failover configuration

    -   if the primary fails, the failure is detected by Elasticache
    -   Elasticache will automatically promote the replica that has the least data replication lag (ie. is the closest in data replication to the primary that failed)
    -   DNS record remains the same by points to the IP address of the promoted replica
    -   other replicas will start to sync with the new primary
    -   you can have fully automated, fault tolerant Elasticache-Redis implementation by enabling both cluster mode and multi-AZ failover
    -   if clustering mode is enabled, multi-AZ failover will also be enabled (multi-AZ failover is required for clustering mode to be enabled)

    -   the scenario would be different if the multi-AZ failover was disabled
        -   generally speaking, multi-AZ failover is faster than if it was left to Elasticache (failover disabled) to try to fix or replace the failed primary with another node

# Redshift

-   a data **warehouse** is a relational **database** that is designed for query and analytics rather than for transaction processing. It usually contains historical data derived from transaction data, but it can include data from other sources
-   **OLAP** (online analytical processing) is characterized by relatively low volume of transactions; queries are often very complex and involve aggregations
-   RDS (MySQL ...etc) is an **OLTP** database, where there is detailed and current data, and a schema used to store transactional data

    -   usually constrained to a single application

-   to perform analytics you need a data warehouse not a regular database
-   a data warehouse can be a layer on top of other OLTP databases

    -   the data warehouse takes data from these databases and creates a layer that is optimized and dedicated to perform analytics

-   Redshift is an AWS, fully managed, **petabyte scale** data warehouse service in the cloud
-   Redshift gives you fast quering capabilities **over structured data** using familiar SQL-based clients and business intelligence (BI) tools using standard ODBC and JDBC connections
-   queries are distributed and parallelized across multiple physical resources
-   you can easily scale Redshift data warehouse up or down with a few clicks in the AWS console or with a single API call
-   Redshift uses replication and continuous backups to enhance availability and improve data durability and can automatically recover from component and node failures

-   Redshift is a SQL based data warehouse used for analytics application
    -   example use cases: Sales reporting, Health care analytics
    -   it is suited for OLAP-based use cases
    -   **can store huge amount of data** (a database), **but can't ingest huge amounts of data in real time** (not like what Kinesis can do)
-   you can launch and configure it from AWS console or through AWS APIs
-   Redshift can

    -   fully recover from a node or component failure
    -   it automatically patches and performs data backup
    -   backups can be stored for a user defined retention period
    -   is 10 times faster than traditional SQL RDBS

-   no upfront commitments, you can start small and grow as required
    -   you can start with a single, 160GB, Redshift data warehouse node
-   for a multi-node deployment (cluster), you need a leader ndoe and compute node(s)

    -   the leader node manages client connections ad receives queries
    -   the compute nodes store data and prefrorm queries and computations
    -   you can have up to 128 compute nodes in a cluster

-   metrics for compute utilization, storage utilization, and read/write traffic to your Redshift data warehouse cluster, are available free of charge via the AWS console of AWS Cloudwatch APIs
-   you can also add additional, user-defined, metrics via AWS CloudWatch custom metric functionality

## data security

-   supports encryption of data _at rest_ using hardware accelerated AES-256 bits
    -   by default, AWS Redshift takes care of encryption keyp management
    -   you can choose to manage your own keys through HSM or AWS KMS
-   supports SSL encryption, _in transit_, between client application and Redshift data warehouse cluster
-   you can't have direct access to your AWS Redshift cluster nodes, however, you can thtough the application themselves

## performance

-   Redshift uses a variety of features to achieve much faster performance compared to traditional SQL DBs
    -   columnar data storage
        -   data is stored squentially in columns instead of rows
        -   columnar based DB is ideal for data warehousing and analytics
        -   requires far fewer I/Os, which greatly enhances performance
    -   advanced compression
        -   data is stored sequentially in columns which allow for much better compression
            -   less storage space
        -   redshift automatically selects compression scheme
    -   Massive Parallel Processing (MPP): Data and query loads are distributed across all nodes

## backups

-   Redshift automaticall patches and bucks up (snapshots) your data warehouse, storing the backups for a user-defined retention period in S3
-   it keeps the backup by default for one day (24 hours) but you can configure it from 0 to 35 days
-   automatic backups are stopped if you choose retention period of 0
-   you have access to these automated snapshots during the retention period
-   if you delete the cluster

    -   you can choose to have a final snapshot to use later
    -   manual backups are not deleted automatically, if you do not manually delete them, you will be charged standard S3 storage rates

-   AWS redshift currently supports only one AZ (no multi-AZ option)
-   you can restore from your backup to a new Redshift cluster in the same or a different AZ
    -   this is helpful in case the AZ hosting your cluster fails

## availability and durability

-   Redshift automatically **replicates all** your data within your data warehouse cluster
    -   to other drives within the cluster to maintain copies of your original data
-   Redshift always keeps three copies of your data
    -   the original one
    -   a replica on compute nodes (within cluster)
    -   a backup copy one S3
-   Redshift can asynchronously replicate you snapshots to S3 in another region fro DR

-   Amazon Redshift will automatically detect and replace a failed node in your data warehouse cluster
-   the data warehouse cluster will be unavailable for queries and updates until a replacement node is provisioned and added to the DB
-   Redshift makes your replacement nodes available immediately and loads your most frequently accessed data from S3 first to allow you to resume querying your data as quickly as possible
-   single node cluster do not support data replication
    -   in the event of a drive failure you will need to restore the cluster from snapshot on S3
    -   AWS recommends using at least two nodes for production

**scaling**

-   this period of unavailabilty typically lasts only a few minutes, and will occur during the maintenance window for you data warehouse cluster, unless you specify that the modification should be applied immediately
-   Redshift moves data in paralled from the compute nodes in your existing data warehouse cluster to the compute nodes in your new cluster
-   this enables your operation to complete as quickly as possible

## billing

-   you pay for
    -   **compute node hours** - compute node hours are the total number of hours you run across all your compute nodes for the billing period; you are billed for 1 unit per node per hour; you are not charged for the leader node
    -   **backup storage** - backup storage is the S3 storage associated with your automated and manual snapshots for your data warehouse
        -   be careful if you change your backup retention period (extra charges)
    -   **data transfer** - there is no data transfer charge for data transferred to, or from, Redshift and S3 within the same region
        -   for all other data transfers into and out of Redshift, you will be billed at standard AWS data trasnfer rates

# Kinesis

-   streaming of data
    -   is the data that is generated and sent continuously from a large number (1000s or hundreds of 1000s) of data sources, where data is sent is small sizes (usually in Kbytes or MBytes)
-   Kinesis, is a platform for streaming data on AWS (used for IoT and Bigdata analytics)
    -   it offers powerful services to make it easy to load and analyze streaming data
    -   it facilitates the way to build custom streaming data Apps for specialized needs
    -   Kinesis is an AWS managed streaming data service(s)
-   Kinesis can continuously capture and store Terabytes of data per hour from 100s of thousands of sources
-   it offers three **managed services**, there are

    -   Kinesis Streams, Kinesis Firehose, Kinesis Analytics

-   sources of data
    -   IoT sensors
    -   Log files from customers of mobile and web apps
    -   eCommerce purchases
    -   in-game player activities
    -   social media networks
    -   financial trading floors and stock markets
    -   telemetry

## Kinesis Streams

-   use Kinesis Streams to collect and process large streams of data records in real time
-   custom data-processing applications, known as **Amazon Kinesis Streams applications** read data from an Kinesis stream as data records
    -   these applications use the Kinesis Client Library and run on Amazon EC2 instances
    -   the processed records can be
        -   send to dashboards
        -   used to generate alerts
        -   used to dynamically change pricing and advertising strategies
        -   saved to a variety of other AWS services (EMR, dynamoDB, redshift)
-   Kinesis can make this huge streams of data available for processing by AWS services or customer applications in less than a second

-   **producers** - put records into Kinesis streams
-   **consumers** - get records from Kinesis Streams and process them
-   **Kinesis Stream applications** - is a consumer of a stream that commonly runs on a fleet of EC2 instances
-   **shard** - is a uniquely identified group of data records in a stream; a stream is composed of one or more shards
    -   a shard is the base throughput unit of a stream
        -   it can take up to 1 Mb/s input and 2 Mb/s output
        -   can support 1000 PUT records/sec
-   **record** - the data unit stored in a Kinesis stream

-   Kinesis streams manages the infrastructure, storage, networking, and configuration needed to stream your data at the level of your data throughput
    -   you do not need to worry about provisioning, deployment, ongoing-maintenance of hardware, software, or other services for your data streams
-   Kineses Streams synchronously replicates data across three availability zones, providing high availability and data durability
-   Kinesis Streams use cases
    -   Accelerated log and data feed intake
    -   real time metric and reporting analytics
    -   complex stream processing (successive stages of stream processing)

### retention period

-   the time for which data records will be kept and made accessible to Kinesis streams applications
-   default is 24 hours
-   can be extended to 7 days for additional charges

### encryption

-   **server-side encryption**
    -   Kinesis streams can automatically encrypt sensitive data as a producer enters it into a stream
    -   kinesis streams uses KMS master keys for encryption
    -   to read from or write to an encrypted stream, producers and consumers applications must have permissions to access the master key
    -   using server-side encryption incurs KMS costs

## Kinesis Firehose

-   use **Kinesis Firehose** to deliver real-time streaming data to destinations such as S3 and Redshift; is the easiest way to load streaming data into AWS
    -   Kinesis streams can be used as the sources to Kinesis Firehose
    -   you can configure Kinesis Firehose to transform your data before delivering it
-   Amazon Kinesis Firehose is a fully managed serivce for automatically capturing real-time data stream from producers (sources) and delivering them to destinations such as
    -   AWS S3
    -   Redshift
    -   Elasticsearch services
    -   Splunk
-   with Kineses Firehose you don't need to write applications or manage resources

-   it can batch, compress, and encrypt the data before loading it, minimizing the amount of storage used at the destination and increasing security
-   Kinesis Firehose manages all underlying infrastructure, storage, networking; you do not have to worry about provisioning, deployment, ongoing mainenance
    -   firehose also scales elastically without requiring any intervention
-   Kinesis Data Firehose synchornously replicates data across three facilities in an AWS Region providing high availability and durability for the data as it is transported to the destinations
-   each delivery stream stores data records **for up to 24 hours in case** the delivery destination is unavailable
-   Firehose can invoke an AWS Lambda function to transform incoming data before delivering it to destinations

-   for AWS S3 destinations, streaming data is delivered to your S3 bucket
-   if data transformation is enabled, you can optionally back up source data to another S3 bucket
-   ElasticSearch case is similar

-   for AWS Redshift destinations, streaming data is delivered to your S3 bucket first
    -   Kinesis Firehose then issues an Amazon Redshift **COPY** command to load data from your S3 bucket to your Redshift cluster
    -   if data transformation is enabled, you can optionally back up source data to another S3 bucket

**server-side encryption**

-   if you have sensitive data, you can enable server-side data encryption when you use Kinesis Firehose
    -   however, this is only possible if you use a Kinesis Streams as your data source

## Kinesis Analytics

-   use **Amazon Kinesis Analytics** to process and analyze streaming data with standard SQL
-   the service enables you to quickly author and run powerful SQL code against streaming sources
-   the service supports ingesting data from Kinesis Streams and Kinesis Firehose streaming sources
-   you can also configure destinations where you want Kinesis Analytics to persist the result
-   Kinesis Analytics supports Kinesis Firehose (S3, Redshift, and Elasticsearch), and Amazon Kinesis Streams as destinations

-   Kinesis Analytics needs permissions to read records from a streaming source and write application output to the externam destinations
-   you use IAM roles to grant these permissions
-   note here the sources and the fact that the application is SQL code based

-   Kinesis Analytics enables you to quickly author SQL code that continuously reads, processes, and store data in near real time
-   using standard SQL queries on the streaming data, you can construct applications that transform and gain insight into your data
-   use cases
    -   **generating time-series analytics** - you can calculate metrics over time window, and then stream values to S3 or Redshift through Kinesis Firehose delivery stream
    -   **feed real-time dashboards** - you can send aggregated and processed streaming data results downstream to feed real-time dashboards
    -   **create real-tiem metrics** - you can create custom metrics and triggers for use in real-time monitoring, notifications, and alarms

# SQS

-   SQS is a fast, reliable, fully managed message queue service
-   is a web service that gives you access to messages queue that store messages waiting to be processed
-   it offers a reliable, highly scalable, hoster queue for storing messages between computers
-   it allows the decoupling of application components such that a failure on one component does not cause a bigger problem to application functionality (like in coupled applications)
-   using SQS, you no longer need a highlt available message cluster of the burden of building/running it

-   you can delete all the messages in an SQS queue wihtout deliting the queue itself
-   you can use applications on EC2 instances to read and process the SQS queue messages
-   you can use auto-scaling to scale the EC2 fleet processing the SQS messages, as the queue size increases
-   these applications on EC2 instances can process the SQS messages/jobs then post the results to other SQS queues or other AWS services

-   priced per milion requests
-   a request is any SQS action

    -   it can have 1-10 messages, up to maximum request payload size of 256KB
    -   SQS messages can be sent, received, deleted in batches up to 10 messages or 256KB
    -   each 64KB is a chunk, a chunk is one request
    -   an SQS message size can be 1KB up to 256KB

-   data transferred between SQS and EC2 instances in the same region is free

*   types

    -   **standard queue**
        -   high throughput (unlimited)
        -   at least once delivery
        -   duplicates are possible (can't guarantee no duplication)
        -   best effor ordering
    -   **FIFO queue**
        -   limited throughput - 300 transactions per second (TPS) throughput
        -   exactly-once processing
        -   no duplicates guarantee
        -   strict ordering - first-in-first-out

*   example
    -   a video transcoding website uses EC2, SQS, S3, and DynamoDB
        -   end users submit videos to be transcoded to the website
        -   the videos are stored in S3, and a request message is placed in an incoming SQS queue with a pointer to the video and to the target video format within the message
        -   the transcoding engine that runs on a set of EC2 instances reads the request message from the incoming queue, retrieves the video from S3 using the pointer and transcodes the video into the target format
        -   the converted video is put back into S3 and another response message is placed in another outgoing SQS queue with a pointer to the converted video
        -   at the same time, metadata about the video (format, date created, length and so on) is indexed into DynamoDB for querying
        -   during this workflow, a dedicated auto-scaling instance can constantly monitor the incoming queue. Based on the number of messages in the incoming queue, the auto-scaling instance dynamically adjust the number of transcoding EC2 instances to meet the response time requirements of the website's customers

## polling

-   SQS is a polling based service (while SNS service is a push based service)
-   two types of polling
    -   short (default)
    -   long

### short polling

-   a request is returned immediately even if the queue is empty
    -   it does not wait for messages to appear in the queue
    -   it queries only a subset of the available servers for messages (based on weighted random distribution)
    -   default of SQS
    -   _ReceiveMessageWaitTime_ is set to 0
-   more requests are used, which implies higher cost

### long polling

-   is preferred to regular/short polling, it uses fewer requests and reduces cont by
    -   eliminating false empty responses by querying all the servers
    -   reduces the number of empty responses, by allowing SQS to wait until a message is available in the queue before sending a response. Unless the connection times out, the reponse to the ReceiveMessage
-   request contains at least one of the available messages, up to the maximum number of messages specified in the ReceiveMessage action
-   do not use if your application expects an immediate response to receive message calls
-   _ReceiveMessageWaitTime_ is set to a non zero value (up to 20 seconds)
-   same charge per million requests as the regular/short polling

## retention period

-   SQS messages can remain in the queue for up to 14 days (SQS retention period)
    -   range is 1 min to 14 days (default is 4 days)
    -   once the maximum retention period of a message is reached, it will be automatically removed from the queue
-   messages can be sent to the queue and read from the queue simultaneously
-   SQS can be used with
    -   Redshift, DynamoDB, EC2, ECS, RDS, S3, Lambda to make distributed/decoupled applications
-   you can have multiple SQS queues with different priorities in case you want one SQS queue messages to be handled with higher priority over other SQS queue messages
-   you can scale up the send/receive messages by creating more queues for different processes/actions

## visibility timeout

-   is the durationof time (length) a message is locked for read by other consumers (after it has been read by a consumer to process it) so they can not be read again (by another consumer)
    -   max is 12 hours
    -   consumer is an application processing the SQS queue messages
-   a consumer that read a message to process it, can change the message visibility timeout if it needs more time to precess the message
-   after a message is read, there are the following possibilities

    -   an ACK is received that a message is processed, so it must be deleted from the queue to avoid duplicates
    -   if a FAIL is received or the visibility timeout expires, the message will the be unlocked for read, such that is can be processed by another consumer

-   if you want to space the messages in the queue in time
    -   you can configure individual message delay of up to 15 minutes
        -   this helps when need to schedule jobs with delay

## reliability and security

-   SQS stores all message queues and messages within a single, highly-available AWS region with multiple rendundant AZs

    -   no single computer, network, or AZ failure can make messages inaccessible

-   use can use IAM policies to control who can read/write messages from/to an SQS queue
-   authentication mechanism ensure that messages stored in SQS message queues are secured against unauthorized access
    -   you can control who can send messages to a message queue and who can receive messages from a message queue
    -   for additional security, you can build your application to encrypt messages before they are placed in a message queue
-   SQS supports HTTPS and TLS versions 1.0, 1.1, 1.2 in all regions
-   SQS is PCI DSS level 1 and HIPAA compliant

-   SSE lets you transmit sensitive data in encrypted queue
    -   SSE protects the contents of messages in SQS queue using KMS managed keys
    -   SSE encrypts messages as soon as SQS receives them
    -   the messages are stored in encrypted form and SQS decrypts messages only when they are sent to an authorized consumers
    -   it uses AES-256 bits encryption
-   AWS KMS combines secure, highly available hardware and software to provide a key management system scaled for the cloud
-   both standard and FIFO queues support SSE
-   SSE for SQS is not available in all regions, check the inteded region for availability => if the region does not support SSE then you can always encrypt the messages before storing them into SQS queue (but then you need to manage encryption keys on your own and make sure that the consumer has access to the key used to encrypt the message so that it can decrypt it one it receives the message)

-   SSE encrypts the body of a message in an SQS queue, SSE does not encrypt the following components
    -   Queue metadata (queue name and attributes)
    -   message metadata (message ID, timestamp, and attributes)
    -   per-queue metrics
-   encrypting a message makes its contents unavailable to unathorized ar anonymous users
    -   encrypting messages doesn't affect the normal functioning of SQS
-   a message is encrypted only if it is sent after the encryption of a queue is enabled, SQS doesn't encrypt backlogged messages
-   any encrypted message remains encrypted even if the encryption of its queue is disabled (new message are of course not encrypted)

## limits and logging

-   **in-flight messages** are the messages that are received from the queue by a consumer application but not deleted from the queue yet
-   standard queues - an SQS limit of 120,000 in-flight messages per queue
    -   if your reach this limit, SQS returns the _OverLimit_ error message
    -   to avoid reaching the limit, you should delete messages from the queue after they are processed
    -   you can also increase the number of queues you use to process your messages
-   FIFO queues - an SQS limit of 20,000 in-flight messages per queue
    -   if you reach this limit, SQS returns no error message

### monitoring

-   SQS and CloudWatch are integrated and you can view and monitor SQS queues' metrics using CloudWatch
    -   this is supported for both standard and FIFO based SQS queues
-   CloudWatch metrics for your SQS queues are automatically collected and pushed to CloudWatch every five minutes
    -   CloudWatch considers a queue to be active for up to six hours if it contains any messages or if any API action accesses it
-   there is no charge for the SQS metrics reported in CloudWatch, they are provided as part of the SQS service

### CloudTrail logging

-   SQS is integrated with CloudTrail, a service that captures API calls made by or on behalf of SQS in your AWS account and delivers the log files to the specified S3 bucket
-   CloudTrail captures API calls made from the Amazon SQS console or from the SQS API
-   you can use the information collected by CloudTrail to determine which requests are made to SQS, the source IP address from which the request is made, who made the request, when it was made ...etc

# DynamoDB

-   DynamoDB is a fully managed NoSQL database that supports both document and key-value store
    -   is extremely fast and delivers predictable performance with seamless scalability
    -   use for applications that need **consistent**, **single-digit millisecond latency** at any scale
    -   is a web service that uses HTTP over SSL (HTTPS) as a transport and JSON as a message serialization format
-   use cases

    -   mobile apps
    -   web apps
    -   gaming apps
    -   ad-tech apps
    -   IoT

-   DynamoDB tables are schemaless
    -   which means that neither the attributes nor their data types need to be defined beforehand
    -   each item can have its own attributes
-   DynamoDB dose not support

    -   complex relations DB querying or JOINs
    -   does not support complex transaction

-   DynamoDB automatically replicates data across three facilities (not AZs) in an AWS region for H.A and data durability
    -   it also partitions your DB over sufficient number of servers accodring to your read/write capacity
    -   performs automatic failover in case of any failure
-   DynamoDB runs exclusively on SSD volumes which provide

    -   low latency
    -   predictable performance
    -   high I/Os

-   **read consistency**
    -   DynamoDB supports both eventual consistency (default) and strong consistency models
        -   **eventual consistency reads**
            -   when you read data from DynamoDB table, the response might not reflect the results of a recenly completed write operation
            -   best read throughput
            -   consistency across all copies is reached in 1 second
        -   **strong consistency reads**
            -   a read returns a result that reflects all writes that received a successful response prior to the read
        -   users/applications reading from DynamoDB tables can specify in their requests if they want strong consistency, otherwise it will be eventually consistent reads (default)
            -   so the application will dictate what is required, strong, eventual, or both

## tables

-   like all other DBs, DynamoDB stores data in tables
-   a table is a collection of data items

-   DynamoDB allows low latency read/write access to items ranging from 1 byte to 400KBs
-   DynamoDB can be used to store pointers to S3 stored objects, or items of sizes larger than 400KB too if needed
-   DynamoDB stores data indexed **by a primary key**
    -   you specify the primary key when you create the table
-   each item in the table has a unique identifier, or primary key, that distinguishes the item from all of the others in the table
-   the primary key is the only required attribute for items is a table
-   DynamoDB supports GET/PUT operations using a used defined primary key

### items

-   each table contains multiple items
-   an item, is a group of attributes that is uniquely identifiable among all of the other items
-   in item consists of a primary or composite key and a flexible number of attributes
-   items in DynamoDB are similar to rows, records in other DBs
-   there is no limit to the number of items you can store in a table
-   max. size if an item is 400KB

### attributes

-   each item is composed of one or more attributes
-   an attribute consists of the attribute name and a value or a set of values
-   an attribute is a fundamental data element, something that does not need to be broken down any further
-   attributes in DynamoDB are similar to fields or columns in other database systems
