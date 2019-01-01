-   [Elasticache](#elasticache)
    -   [caching strategies](#caching-strategies)
    -   [Memcached](#memcached)
    -   [Redis](#redis)

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
