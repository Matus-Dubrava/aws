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
    -   [capacity units](#capacity-units)
    -   [scaling](#scaling)
    -   [integration](#integration)
    -   [best practices](#best-practices)
-   [ECS](#ecs)
    -   [Docker](#docker)
    -   [ECS](#ecs)
    -   [launch types](#launch-types)
    -   [tasks](#tasks)
    -   [roles](#roles)
-   [Directory Service](#directory-service)
    -   [Microsoft AD](#microsoft-ad)
    -   [Simple AD](#simple-ad)
    -   [AD connector](#ad-connector)
-   [Cloud Formation](#cloud-formation)
-   [OpsWorks](#opsworks)
    -   [Chef](#chef)
    -   [Stack](#stack)
    -   [Instances](#instances)

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

## capacity units

### read capacity units

-   one read capacity unit represents one strongly consistent read per second, or two eventually consistent reads per second up to 4KB size
-   if you need to read an item that is larger than 4KB, DynamoDB will need to consume additional read capacity units
    -   the total number of read capacity units required depends on the item size, and wether you want an eventual consistency or strong consistency

### write capacity units

-   one write capacity unit represents one write per second for an item up to 1KB in size
-   if you need to write an item that is larger than 1KB, DynamoDB will need to consume additional write capacity units
-   the total number of write capacity units required depends on the item size

## scaling

-   it provides for a push button scaling on AWS where you can increase the read/write throughput and AWS will go ahead and scale it for you (up or down) without any downtime or performance degradations
-   you can scale the provisioned capacity of your DynamoDB table anytime you want
-   you can scale down your provisioned capacity only 4 times during a calendar day
-   there is no limit to the number of items (data) you can store in a DynamoDB table
-   there is no limit on how much data you can store in a DynamoDB table

-   DynamoDB can do 10,000 write capacity units/sec, or 10,000 read capacity units per second per table

    -   if you need more, contact AWS

-   if your read or write requests exceed the throughput setting for a table, DynamoDB can throttle that request
-   DynamoDB can also throttle read requests exceeds for an index
    -   throttling prevents your application from consuming too many capacity units
    -   when a request is throttled, it fails with an HTTP 400 code (bad request) and a _ProvisionedThroughputExceededException_
-   the AWS SDKs have built-in support for retrying throttled requests

## integration

### loading data from DynamoDB into Redshift

-   Redshift complements DynamoDB with advanced BI capabilities and a powerful SQL-based interface
-   when you copy data from a DynamoDB table into Redshift, you can perform complex data analysis queries on that data, including joins with other tables in your Redshift cluster
-   in terms of provisioned throughput, a copy operation from a DynamoDB table counts against that table's read capacity
-   after the data is copied, your SQL queries in Redshift do not affect DynamoDB in any way
-   before you can load data from DynamoDB table, you must first create a Redshift table to serve as the destination for the data
-   keep in mind that you are copying data from NoSQL environment into an SQL environment, and that there are certain rules in one environment that do not apply to the other

### integration with EMR

-   EMR is a service that makes it easy to quickly and cost-effectively process vast amounts of data
-   **processing DynamoDB data with Apache Hive on EMR**

    -   DynamoDB is integrated with **Apache Hive**, a data warehousing application that runs on EMR
    -   Hive can read and write data in DynamoDB tables, allowing you to

        -   query live DynamoDB data using an SQL-like language (HQL)
        -   copy data from a DynamoDB table to an S3 bucket, and vice-versa
        -   copy data from a DynamoDB table into Hadoop Distributed File System (HDFS), and vice-versa
        -   perform join operations on DynamoDB table

## best practices

-   keep item size small
-   if you are storing serial data in DynamoDB that will require actions based on data/time
    -   use separate tables for days, weeks, months
-   you may choose to store more frequntly accessed data in a separate table and not mix it with less frequently accessed data
-   if possible, compress larger attribute values (saves cost, table size ...etc)
-   you can store attributes that are larger than 400KB in S3
    -   and store the S3 ObjectID in the corresponding items in DynamoDB table
-   you can also store the primary key value in S3's object metadata

# ECS

Containers and virtual machines have similar resource isolation and allocation benefits, but function deifferently because containers virtualize the operating system instead of hardware. Containers are more portable and efficient.

With VMs, you could run lost of different operating systems on the same server; containers are isolated but they share OS

-   Virtual Machines

    -   VMs are an abstraction of the physical harware, where the hypervisor can allow multiple VMs can be run on the same server
    -   with virtualization technology, the VM includes the entire operating system, as well as the application so you have as may operating system instances as the number of VMs on the physical host

-   Containers
    -   containers are a further level of abstraction at the application level, it packages code and dependecies (Binary, and Lib files) together
    -   multiple containers can run on the same machine and share the OS kernel with other containers, each running as isolated processes in user space
    -   also, a container size is in the order of tens of MBs, where as a VM size is in order of GBs
        -   hence, containers start almost immediately
    -   due to the container size, a sever can host far more containers than virtual machines
    -   speed of booting up
        -   application components can be available almost immediately
    -   pave the way to application microservices (decoupling of application components)
    -   containers make application portability much easier, since each containerized application has all the libraries, system tools, code, and runtime that it needs to run successfully
    -   containers solve the problem of how to get application (software) to be moved and run reliably when moved from one computing environment to another
    -   containers have the entire runtime environment components bundled into one package, this includes, the application, plus all its dependencies, libraries and other binaries, and configuration files needed to run it
    -   containerizing the application platform and its dependecies, differences in OS distributions and underlying infrastructure do not impact the application functionality (due to abstraction)

## Docker

-   Docker is a software platform that allows you to build, test, and deploy distributed applications quickly
-   Docker packages software into standardized units called containers, that have everything the software needs to run including libraries, system toos, code, and runtime
-   using Docker, you can quickly deploy and scale applications into any environment and know your code will run
-   running Docker on AWS provides developers and admins a highly realiable, low-cost way to build, ship, and run distributed applications at any scale
    -   ECS uses Docker images in task definitions to launch containers on EC2 intsances in your cluster
-   AWS supports both Docker licencing models: open source Docker Community Edition (CE) and subscribtion-based Docker Enterprise Edition (EE)
-   a container image is a lightweight, stand-alone, executable package of a piece of software that includes everything needed to run it: code, runtime, system tools, system libraries, settings
-   available for both Linux and Windows based apps, containerized software will aways run the same, regardless of the environment
-   containers isolate software from its surroundings, for example differences between development and staging environments and help reduce conflicts between teams running different software on the same infrastructure
-   the docker (container) engine is the rought equivalent to Hypervisors in VMs, Docker being the most famous Container Engine today

-   containers are

    -   **lightweight**
        -   Docker containers running on a single machine share that machine's operating system kernel, they start instantly and use less compute and RAM; images are constructed from filesystem layers and share common files; this minimizes disk usage and inage downloads are much faster
        -   **standard**
            -   Docker containers are based on open standards and run on all major Linux distributions, Microsoft Windows, and on any infrastructure including VMs, bare-metal and in the cloud
        -   **secure**
            -   Docker containers isolate applications from one another and from underlying infrastructure
            -   docker provides the strongest default isolation to limit app inssues to a single container instead of the entire machine

-   The additional software(s) needed to support the use of standardized containers in an enterprise or cloud environment are container orchestration and management systems, and containers security systems
    -   container management software will help you push those containers out to different machines
    -   it makes sure that they run and spin up a few more containers with a specific application when demand increases
    -   if the containers need to know about each other, you also still need some way of setting up a virtual network, too, that can assign IP addresses to every container

## ECS

-   ECS is a highly scalable, fast, container management service that makes it easy to run, stop, and manage Docker containers on a cluster
-   you can host your cluster on a **serverless infrastructure that is managed by ECS** by launching your services or tasks using the **Fargate launch type**
-   for more control you can host your tasks on a a cluster of EC2 instances that you manage by using the **EC2 launch type**
-   ECS lets you:

    -   launch and stop container-based applications with simple API calls
    -   allows you to get the state of your cluster from a centralized service
    -   gives you access to many familiar EC2 features

-   you can use ECS to schedule the placement of containers across your cluster based on your resource needs, isolation policies, and availability requirements
-   ECS eliminates the need for you to operate your own cluster management and configuration management systesm to worry about scaling your management infrastructure
-   ECS can be used to create a consistent deployment and build experience, manage, and scale batch and Extract-Transform-Load (ETL) workloads, and build sophisticated application architecture on a microservices model

-   **features of ECS**

    -   ECS is a **regional** service that simplifies running application containers in a highly available manner across multiple AZs within a region
    -   you can create ECS cluster within a new or existing VPC
    -   after a cluster is up and running, you can **define task definitions and services** that specify which Docker container images to run across your cluster
    -   container images are stored in and pulled from container registries, which may exist within or outside of your AWS infrastructure

-   **containers and images**

    -   to deploy applications on ECS, your application components must be architected to run in a _container_
    -   a docker container is a standardized unit of software development, containing everything your software application needs to run: code, runtime, system tools, system libraries, etc. Containers are created from a read-only template called an _image_
    -   Images are typically built from a Dockerfile, a plain text file that specifies all of the components that are included in the container. These images are then stored in a _registry_ from which they can be downloaded and run on your cluster

-   **dockerfile**

    -   docker can build images automatically by reading the instructions from a Dockerfile
    -   Dockerfile is a text document that contains all the commands a user could call on the command line to assemble an image
    -   using docker build users can create an automated buid that executes several command-line instructions in a succession

-   **docker images**
    -   much like the AMI in AWS, a docker image is an inert, immutable, file that's essentially a snapshot of a container
    -   **images** are created with the build command, and they'll produce a container when started with run
    -   **images** are stored in a Docker registry as Docker Hub (registry.hub.docker.com)

## launch types

-   **fargate launch type**
    -   the fargate launch type allows you to run your containerized applications without the need to provision and manage the backed infrastructure; just register your task definitions and fargate launches the container for you
    -   you are hosting your cluster on a **serverless infrastructure that is managed by ECS** by launching your services or tasks using the **fargate launch type**
-   **EC2 launch type**

    -   EC2 launch type allows you to run your containerized applications on a cluster of EC2 instances that you manage
        -   provides for more control
        -   you need to manage the EC2 fleet

-   the fargate launch type only supports using container images hosted in ECR or publicly on Docker Hub
-   private repositories are currently only supported using the EC2 launch type
-   ECS container instance is an EC2 instance that is running the ECS container agent and has been registered into a cluster
-   when you run tasks with ECS, your tasks using the EC2 launch type are placed on your active container instances
-   **note**, tasks using the fargate launch type are deployed onto AWS-managed infrastructure so this topic does not apply

## tasks

-   to prepare your application to run on ECS, you create a _task definition_
-   the task definition is a text file, in JSON format, that describes one or more containers, up to a **maximum of ten**, that form your application; it can be thought of as a bluepring for your applications
-   task definitions specify various parameters for your application such as

    -   which containers to use and the repositories in which they are located
    -   which ports should be opened on the container instance for your application
    -   what data volumes should be used with the containers in the task
    -   the specific parameters available for the task definition depends on which launch type you are using

-   **create a docker image**

    -   ECS tas definitions use Docker images to launch containers on the container instances in you cluster
    -   to use a Docker image in your task definitions you need to
        -   create the docker image
        -   then test it
        -   then push the image to a container registry (such as ECR or Docker Hub) so you can use it in a ECS task definition
    -   after the image push is finished, you can use your image in your ECS task definitions, which you can use to run tasks with

-   **ECR** is a managed Docker registry service; customers can use the familiar CLI to push, pull, and manage imanges

-   __ECS task__
    -   __is the instatiation of a task definition within an ECS cluster__
        -   after you have created a task definition for your application within ECS, you can specify the number of tasks that will run on your cluster

-   __ECS task scheduler__ is responsible for placing tasks within your cluster
-   there are several different scheduling options available
    -   for example, you can define a _service_ that runs and maintains a specified number of tasks simultaneously

-   __the container agent__
    -   runs on each infrastructure resource within an ECS cluster
    -   it sends information about the resource's current running tasks and resource utilization on ECS, and starts and stops tasks whenever it receives a request from ECS (where ECS is the orchestrator)

## roles

-   by default, IAM users don't have permissions to create or modify ECS resources, or perform tasks using the ECS API
-   ECS container instances make calls to to the ECS and EC2 APIs on your behalf, so they need to authenticate with your credentials
    -   this authentication is accomplished by creating an IAM role for your container instances and associating that role with your container instances when you launch them
-   basically, ECS, IAM can be used to control access at the container instance level using IAM roles

-   the ECS container agent makes calls to the ECS API on your behalf
-   container instances that run the agent require an IAM policy and role for the service to know that the agent belongs to you
-   before you can launch container instances and register them into a cluster, you must create an IAM role for those container instances to use when they are launched
-   __this role only applies if you are using the EC2 launch type__
-   this requirement applies to container instances with the ECS-optimized AMI provided by Amazon, or with any other instances that you intend to run the agent on

-   containers that are running on your container instances __are not prevented from accessing the credentials that are supplied to the container instance__ profile (through the EC2 instance metadata server)
    -   AWS recommends that you limit the permissions in your container instances role to the minimal list of permissions
    -   if the __container in your tasks__ need extra permissions that are not listed here, AWS recommends providing those tasks with __their own IAM roles__, which is accomplished by creating IAM roles for tasks
        -   basically, is AWS ECS, IAM can be used to control access at the task level using IAM task roles
        -   you can create the role using the __EC2 container service task role__ service role in the IAM console

-   you must create an IAM policy for your tasks to use that speciffies the permissions that you would like the containers in your tasks to have
    -   you must also create a role for your tasks to use before you can specify it in your task definitions
-   you can create the role using the __EC2 Container Service Task Role__ service in the IAM console

-   __EC2 container service task role__
    -   before you can use IAM roles for tasks, ECS needs permissions to make calls to the AWS APIs on your behalf
        -   these permissions are provided by the EC2 container service task role
    -   you can create a task IAM role for each task definition that needs permissions to call AWS APIs
    -   you simply create an IAM policy that defines which permissions your task should have, and then attach that policy to a role that uses the EC2 container service task role trust relationship policy

-   __IAM Role for Tasks__
    -   with IAM roles for ECS tasks, you can specify an IAM role that can be used by the containers in a task
    -   applications must sign their AWS API requests with AWS credentials, and this feature provides a strategy for managing credentials for your applications to use, similar to the way that EC2 instance profile provide credentials to EC2 instances
    -   instead of creating and distributing your AWS credentials to the containers or using the EC2 instance's role, you can associate an IAM role with an ECS task definition or RunTask API operation
    -   the applications in the task's containers can then use the AWS SDK or CLI to make API requests to authorized AWS services

-   __creating an IAM role and policy for your tasks__
    -   you must create an IAM policy for your tasks to use that specifies the permissions that you would like the containers in your tasks to have
    -   you must also create a role for your tasks to use before you can specify it in your task definitions
    -   you can create the role using the __EC2 container service task role__ service role in the IAM console
        -   then you can attach your specific IAM policy to the role that gives the containers in your task the permissions you desire
    -   if you have multiple task definitions or services that require IAM permissions, you should consider creating a role for each specific task definition or service with the minimum required permissions for the tasks to operate so that you can minimuze the access that you provide for each task
    
-   __benefits of using IAM roles for tasks__
    -   __credential isolation__ - a container can only retrieve credentials for the IAM role that is defined in the task definition to which it belongs; a container never has access to credentials that are intended for another container that belongs to another task
    -   __authorization__ - unauthorized containers cannot access IAM role credentials defined for other tasks
    -   __auditability__ - access and event logging is available through CloudTrail to ensure retrospective auditing 
    -   tasks credentials have a context of _taskArn_ that is attached to the session, so CloudTrail logs show which task is using which role

-   __cluster concepts__
    -   clusters are region-specific
    -   clusters can contain tasks using both Fargate and EC2 launch types
    -   for tasks using the EC2 launch type, clusters can contain multiple different container instance types, but each container instance may only be part of one cluster at a time
    -   you can create custom AMI policies for your clusters to allow or restrict user's access to specific cluster

# Directory Service

-   directories store information about users, groups, and devices, and administrators use them to manage access to information and resources
-   AWS Dircetory service provides multiple directory choices for customers who want to use existing Microsoft AD or Lightweight Directory Access Protocol (LDAP) - aware applications in the cloud
    -   it also offers those same choices to developers who need a directory to manage users, groups, devices, and access
-   AWS directory service provides different methods to provide Amazon Cloud Directory and Microsoft Active Directory (AD) with other AWS services
-   you can choose the directory service with the features you need at a cost that fits your budget

-   AWS Directory Service includes the following services
    -   Active Directory service for Microsoft Active Directory
    -   Simple AD
    -   AD connector
    -   Amazon Cloud Directory
    -   Cognito

-   __Active Directory service for Microsoft__
    -   is a feature-rich managed Microsoft Active Directory hosted on the AWS cloud
    -   Microsoft AD is your best choice if you have __more than 5,000 users and/or need a trust relationship__ set up between an AWS hosted directory and your on-premises directory
-   __AD connector__
    -   simply connects your existing on-premise Active Directory to AWS; AD connector is your best choice when you want to use your existing on-premise directory with AWS services
-   __Simple AD__
    -   is an __inexpensive__ Active Directory - compatible service with the most common directory features
    -   in most cases, Simple AD is the least expensive option and your best choice if you have 5,000 or fewer users and don't need the more advanced Microsoft Active Directory features

-   __snapshots (simple AD and Microsoft AD)__
    -   AWS directory service provides the ability to take manual snapshots of data for a smiple AD or AWS directory service for Microsoft Active Directory 
    -   these snapshots can be used to perform a point-in-time restore for your directory
-   __note__ - you cannot take snaphosts of AD Connector directories

##  Microsoft AD

-   is a fully managed AWS service on AWS managed infrastructure, so you do not need to worry about software patching and installation, replication, automated backups, replacing failed controllers, or monitoring
-   is powered by an actual Microsoft AD in the AWS cloud
    -   it includes key features, such as schema extensions, with which you can migrate a broad range of Active Directory - aware applications to the AWS Cloud
-   Microsoft AD works with Microsoft Share Point, Microsoft SQL Server Always On Availability Groups, and many .NET applications

-   with AWS Microsoft AD, you can also set up trust relationships to extends authentication from your existing on-premise AD into the CLoud
    -   provides on-premise users and groups with access to resources in either domain, using single sign-on (SSO)
    -   this requires a VPN or Direct Connect between your on-premise and AWS
-   you can use Microsoft AD as a standalone AD to administer users, groups, and computers in the Cloud
    -   when used as a standalone directory, your users can access third-party cloud applications such as MS Office 365, __through federation__
-   you can also use your AD credentials to authenticate to the AWS Management Console without having set up a SAML authentication infrastructure

-   AWS Microsoft AD supports AWS applications and services including Amazon WorkSpaces, Amazon WorkDocs, Amazon QuickSight, Amazon Chime, Amazon Connect, and __Amazon Relational Database Service from Microsoft SQL server (RDS for SQL server)__
-   it includes security features, such as 
    -   fine-grained password policy management 
    -   LDAP encryption through SLL/TLS
    -   it is also approved for applications in the AWS cloud that are subject to HIPAA and PCI DSS
    -   you can use Microsoft AD to enable multi-factor authentication by integrating with your existing RADIUS-based MFA instrastructure to provide an additional layer of security when users access AWS applications
-   AWS provides monitoring (CloudTrail for logging and SNS for notification), daily automated snapshots, and recovery as part of the service

-   AWS Microsoft AD is also scalable, you can increase the performance and redundancy of your directory by adding domain controllers
    -   this can help improve application performance by enabling directory clients to load balance their request accross a larger number of domain controllers
-   it is deployed in HA configuration across two AZs in the same region
-   it supports automated and manual snapshots
-   __comes into two editions__
    -   __standard edition__ - a primary directory for small and midsize businesses with up to 5,000 employees; it provides you enough storage capacity to support up to 30,000 directory objects such as users, groups, and computers
    -   __enterprise edition__ - for enterprise organizations with up to 500,000 directory objects

-   you can build your own MS AD controllers in the AWS Cloud, in case you want to build and manage your own using EC2 instances in your AWS VPC
-   your AWS AD can join your on-premise AD (replication mode), and they can replicate authentication, users, groups information between them, this will make the DB available on both

-   you can also promote the AWS MD AD to be the primary domain cotrollers
-   EC2 instances and applications in your AWS environments that require MS AD will join your own AWS MS AD
-   this replication models also requires a VPN connection between your AWS environment and on-premise 
-   this is more chatty on the VPN and less secure, better use trust mode

-   replication mode is less secure compared to trust relationship mode
-   AWS Microsoft AD does NOT support replication mode when connecing to your on-premise AD, only trust relationship mode is supported

-   __active directory service for Microsoft AD__
    -   when deployed with AWS applications you use existing RADIUS-based multi-factor authentication (MFA) infrastructure to provide an additional layer of security
    -   __use cases__
        -   use it if you need an actual MS AD features in the AWS Cloud that supports AD - aware workloads, or AWS applications and services such as Amazon WorkSpaces and Amazon QuickSight
        -   AD is an LDAP directory, use it when you need LDAP services in the cloud to support your Linux applications (SSSH authentication is an example)
        -   it's also best it you want a standalone AD in the AWS cloud that supports Office 365

## Simple AD

-   simple AD is a standalone, fully managed, directory service in AWS cloud, that is powered by a Samba 4 AD Compatible server
    -   it enables you to create users and control access to applications in AWS
-   Simple AD provides a subset of the features offered by MS AD, including the ability to manage user accounts and group membership, crate and apply group policies, securely connect to EC2 instances, and provide __Kerberos-based single sign-on (SSO)__
-   it also supports joining a Linux domain or Windows based EC2 instances, Kerberos-based SSO, and group policies
-   AWS provides monitoring, daily snapshots, and recovery as part of the service
    -   simple AD also supports daily automated snapshots that enable point-in-time recoverry
    -   it also supports manual snapshots as well

-   you can use many familiar AD-aware applications and tools that require basic AD features
    -   Simple AD is compatible with following AWS applications: Amazon WorkSpace, Amazon WorkDocs, Amazon WorkMail, and Amazon QuickSight
    -   you can also sign in to the AWS management console with Simple AD user accounts and to manage AWS resources

-   it is available in two sizes
    -   __small__ - supports up to 500 users (approximately 2,000 objects)
    -   __large__ - supports up to 5,000 users (approximately 20,000 objects)

-   use it when you need a low-scale, low-cost directory with basicAD compatibility that supports Samba  4-compatible applications, or you need LDAP compatibility for LDAP-aware applications
    -   use case: when you need AD or LDAP services in the cloud
-   when you createa directory with Simple AD, AWS Directory Service creates two directory servers and DNS servers on your behalf
    -   the directory servers are created in different subnets in a VPC, this redundancy ensures that your directory remains accessible even if a failure occurs

-   simple AD does not support DNS dynamic update, schema extensions, multi-factor authentication, communication over LDAPS, PowerShell AD cmdlets, or FSMO role transfer
-   __simple AD is not compatible with RDS SQL server__
-   Simple AD __does not support__ features such as __trust relationship with other domains (use AWS MD AD if you need this feature)__, AD administrative center, PowerShell suport, AD recycle bin, group managed service accounts, and schema extensions for POSIX and MS applications

## AD connector

-   Ac connector is a directory gateway (proxy service) with which you can redirect directory requests yo your on-premises MS AD wihtour caching any information in the cloud
-   AD connector provides an easy way to connect compatible AWS applications, such as Amazon WorkSpaces and Amazon QuickSight, and Amazon EC2 for Windows Server instances, to your existing on-premises MS AD
-   AD connector also eliminates the need of directory synchronization or the cost and complexity of hosting a federation infrastructure
-   AD connector comes in two sizes
    -   small AD connector is designed for smaller organizations of up to 500 users
    -   large AD connector can support larger organizations of up to 5,000 users

-   the VPC must be coonected to your on-premise network through a VPN connection or AWS direct connect
-   when users log in to the AWS applications, AD connector forwards sing-in requests to your on-premises AD domain controllers for authentication
-   you can also join your EC2 Windows instances to your on-premises AD domain through AD connector using seamless domain join
-   AD connector works with many AWS applications and services including as WorkSpaces, WorkDocs, QuickSight, Chime, Connect and WorkMail
-   when you add users to AWS applications such as QuickSight, AD connector reads your existing AD to create lists of users and groups to select from

-   AD connector also allows your users to access the AWS management console and manage AWS resources by logging in with their existing AD credentials
-   AD connector __is not compatible with RDS SQL server__
-   you can also use AD connector to enable multi-factor authentication for your AWS application users by connecting it to your existing RADIUS-based MFA unfrastructure
    -   this provides an additional layer of security when users access AWS applications
-   with AD connector, you continue to manage your AD as you do now
    -   this helps you consistently enforce your security policies, whether users are accessing resources on premises or in the cloud
-   when connected to your on-premises directory, all of your directory data remains on your directory servers; AWS directory service does not replicate any of your directory data

-   AC connector is your best choice when you want to use your existing on-premises directory with compatible AWS services
    -   use it when you only need to allow your on-premises users to log in to AWS applications and services with their AD credentials
    -   you can also use AD connector to join EC2 instances to your existing AD domain

# Cloud Formation

-   AWS CloudFromation is a service that hepls you model and set up your Amazon Web serives resources
    -   this will allow you to spend less time managing those resources and more time focusing on your applications that run in AWS
    -   you can model your CloudFormation template in JSON ro YAML
-   you create a template that describes all the AWS resources that you want (like EC2 instances or RDS DB instances), then
    -   AWS CloudFormation takes care of provisioning and configuring those resources for you
        -   the result is what is called a __stack__
-   you don't need to individually create and configure AWS resources and figure out dependencies; AWS CloudFormation handles all of that

-   simplify infrastructure management
    -   you can create, update, version control and delete your stack and Cloud formation takes care of it
-   quickly replicate your infrastructure
    -   when you use AWS CloudFormation, you can reuse your template to set up your resources consistently and repeatedly
        -   just describe your resources once and then provision the same resources over and over in multiple regions
-   easily control and track changes to your infrastructure
    -   change your resources, upgrade, update, roll back changes, basically, __manage your infrastructure as code__

-   when you create a stack, AWS CloudFormation makes underlying service API calls to AWS to provision and configure your resources
-   AWS CloudFormation can perform only actions that you (who created the template) have permissions to do - or you need to assign role to CloudFormation with specific priviledges
-   if you specify a template file stored locally, AWS CloudFormation uploads it to an S3 bucket in your AWS account
-   AWS CloudFormation creates a bucket for each region in which you upload a template file
-   the buckets are accessible to anyone with S3 permissions in your AWS account
-   if a bucket created by AWS CloudFormation is already present, the template is added to that bucket
-   you can use your own bucket and manage its permissions by manually uploading templates to S3
    -   then whenever you create or update stack, specify the S3 URL of a template file 

-   after all the resources have been created, AWS CloudFormation reports that your stack has been created 
-   __if stack creating fails, AWS CloudFormation rolls back your changes by deleting the resources that it created__

-   when you need to update your stack's resources, you can modify the stack's template
    -   you don't need to create a new stack and delete the old one

-   to update a stack, create a __change set__ by submitting a __modified version of the original stack template__, different input parameter values, or both
-   AWS CloudFormation compares the modified template with the original template and generates a change set
    -   the change set lists the proposed changes
    -   after reviewing the changes and understanding/confirming what will change
        -   you can execute the change set to update your stack or
        -   you can create a new changes set

-   when you delete a stack, you specify the stack to delete, and CloudFormation deletes the stack and all the resources in that stack
    -   you can delete stacks by using the CloudFormation console, CLI, or APIs
-   after all the resources have been deleted, AWS CloudFormation signals that your stack has been sucessfully deleted
-   if AWS CloudFormation cannot delete a resource
    -   the stack will not be deleted
    -   any resources that haven't been deleted will remain until you can sucessfully delete the stack
-   if you want to delete a stack but want to retain some resources in that stack, __you can use a deletion policy to retain those resources__

# OpsWorks

-   Cloud-based computing usually involes groups of AWS resources, such as EC2 instances and RDS instances, which must be created and managed collectively
    -   in addition to creating the instances and installing the necessary packages, you typically need a way to distribute application to the application servers, manage security and permissions, and so on

-   OpsWorks Stacks provides a simple and flexible way to create and manage stacks and applications
-   the stack is the core AWS OpsWorks component

-   for example, a web application typically requires application servers, database servers, load balancers, and so on
    -   this group of instances is typically called a stack

-   AWS OpsWorks stacks provide a rich set of customizable components that you can mix and match to create a stack that satisfies the application requirements
-   OpsWorks allow SSH and RDP access to Stack instances
-   resources can be managed only in the region in which they are created 
-   resources that are created in one regional endpoint are not available, nor can they be cloned to, another regional endpoint

## Chef

-   as the environment grow, manual configuration and deployment practices can result in operational expenses growing at an alarming rate
-   Chef provides automated configuration management that enables consistent configurations at scale
-   chef helps in ensuring that configuration policy is flexible, versionable, testable and human readable
-   servers managed by chef are continuously evaluated against their desired statem ensuring that configuration drift is automatically corrected, and configuration changes are universally applied

-   __cookbook__
    -   it is a package file that contains configuration information, including instructions called recipes

-   __recipes__
    -   recipe is a set of one or more instructions, written in Ruby language syntax, that specifies the resources to use and the order in which those resources are applied
        -   AWS OpsWorks then automatically runs them at the appropriate time
        -   recipes can also be run manually, at any time

-   __resource__
    -   if _Chef terms_, a _resource_, as used in Chef, is a statement of configuration policy
        -   this is different from what a resource is to OpsWorks

## Stack

-   the stack is basically a container for AWS resources - Amazon EC2 instances, RDS and DynamoDB database instances, ELB
    -   these resources have a common purpose and should be logically managed together
    -   the stack helps to manage these resources as a group
    -   the stack also defines some default configuration settings, such as the instances' operating system and AWS region

-   __layers__
    -   a stack can have one or more layers
    -   a layer represents a set of EC2 intsances that serve a particular purpose such as serving applications or hosting a DB server
    -   layers give complete control over which packages are installed, how they are configured, how applications are deployed, and more
    -   you can customize or extend layers by
        -   modifying packages' default configurations
        -   adding Chef recipes to perform tasks such as installing additional packages, and more
    -   for all stacks, AWS OpsWorks includes service layers, which represents the following AWS services
        -   AWS RDS
        -   EBS
        -   ECS
    -   all stacks can include one or more layers, which start with only a minimal set of recipes
    -   layers depend on Chef recipes to handle tasks such as
        -   installing packages on instances
        -   deploying apps
        -   running scripts
    -   you package your custom recipes and replated files in one or more cookbooks and store the cookbooks in a repository such as S3 or Git
    -   after you create a layer, some __properties (such as AWS region) are immutable__, but you can change most of the layer configuration at any time

    -   you can run recipes manually, but AWS OpsWorks Stacks also lets you automate the process bu supporting a set of five __lifecycle policies__
        -   __setup__ occurs on a new instance after it successfully boots
        -   __configure__ occurs on all of the stack's instances when an instance enters or leaves the online state
        -   __deploy__ occurs when you deploy an app
        -   __undeploy__ occurs when you delete an app
        -   __shutdown__ occurs when you stop an instance
    -   each layer can have any number of recipes assigned to each event
        -   these recipes handle a variety of tasks for that event and layer
    -   when a lifecycle event occurs on a layer's instance, AWS OpsWorks runs the associated recipes

    -   an instance that belongs to a web server layer, once it finishes booting, AWS OpsWorks does the following
        -   runs the layer's __setup recipes__, this will install the web server
        -   runs the layer's __deploy recipes__, this will deploy the apps from a repository to the instance
        -   runs the __configure recipes__ on every instance in the stack so each instance can adjust its configuration as needed to accomodate the new instance

## Instances

-   for OpsWorks, an instance represents a single computing resource, such as an EC2 instance
-   the instance in OpsWorks, defines the resource's basic configuration, such as operating system and size
-   other configuration settings, such as Elastic IP addresses or EBS volumes, are defined by the instance's layers
-   the layer's recipes complete the configuration by performing tasks such as installing and configuring packages and deploying apps
-   you can use AWS OpsWorks stacks to create instances and add them to a layer

-   when you start the OpsWorks instance
    -   AWS OpsWorks launches an Amazon EC2 instance using the configuration settings specified by the instance and its layer
    -   after the EC2 instance has finished booting
        -   __AWS OpsWorks installs an agent__ that handles communication between the instance and the service and runs the appropriate recipes in response to lifecycle events

-   __an instance can belong to multiple layers__
    -   if that is the case, then OpsWorks runs the recipes for each layer the instance belongs to
    -   for example, you can have an instance that supports a PHP application server and a MySQL database server
        -   if you have implemented recipes, you can assign each recipe to the appropriate layer and event
            -   AWS OpsWorks then automatically runs them at the appropriate time

__instance types__
-   classified according to how they are started and stopped
    -   OpsWorks Stacks supports the following instance types
        -   __24/7 instances__
            -   are started manually and run until you stop them
        -   __time-based instances__
            -   are run by AWS OpsWorks on a specified daily and weekly schedule 
            -   they allow the stack to automatically adjust the number of instances to accommodated predictable usage patterns
        -   __load-based instances__
            -   are automatically started and stopped by AWS OpsWorks, based on specified load metrics, such as CPU utilization
            -   they allow the stack to automatically adjust the number of instances to accomodate variations in incomming traffic
            -   currently, load-based instances are available only for Linux-based stacks

__AWS OpsWorks instance Autohealing__
-   OpsWorks support instance autohealing in the following manner
    -   if an OpsWorks agent on an instance stops communicating with the service, OpsWorks automatically stops and restarts the instance
    -   note an instance an be a member of multiple layers
        -   if any of those layers has auto healing disabled, __OpsWorks stacks does not heal the instance if it fails__
    -   if a layer has auto healing enabled - the default setting - OpsWorks stacks automatically replaces the layer's failed instances

-   if you have existing computing resources such as EC2 instances or even on-premises instances that are running on your own hardware
    -   you can incorporate them together into a stack, along with instances that you created with OpsWorks Stacks

