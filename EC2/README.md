-   [EC2](#ec2)
-   [Instance Types](#instance-types)
-   [EBS](#ebs)
-   [Instances](#instances)
-   [Apache Web Server on EC2](#apache-web-server-on-eC2)
-   [Security Groups](#security-groups)
-   [Volumes and Snapshots](#volumes-and-snapshots)
-   [Load Balancers](#load-balancers)
-   [Cloud Watch](#cloud-watch)
-   [Instance Metadata](#instance-metadata)
-   [Placement Groups](#placement-groups)
-   [Review](#review)

# EC2

Amazon Elastic Cloud Compute (Amazon EC2) is a web service that provides resizable compute capability in the cloud. Amazon EC2 reduces the time required to obtain and boot new server instances to minutes, allowing you to quickly scale capacity, both up and down, as your computing requirements change.

Amazon EC2 changes the economics of computing by allowing you to pay only for capacity that you actually use. Amazon EC2 provides developers the tools to build failure resilient applications and isolate themselves from common failure scenarios.

## Types

-   **On Demand** - allows you to pay a fixed rate by the hour (or by the second) with no commitment
    -   perfect for users that want the low cost and flexibility of Amazon EC2 without any up-front payment or long-term commitment
    -   applications with short term, spiky, or unpredictable workloads that cannot be interrupted
    -   applications being developed or tested on Amazon EC2 for the first time
-   **Reserved** - provides you with a capacity reservation, and offer a significant discount on the horly charge for an instance. 1 Year or 3 Year Terms
    -   applications with steady state or predictable usage
    -   applications that require reserved capacity
    -   users can make up-front payments to reduce their total computing costs even further
        -   Standard RIs (Up to 75% off on-demand)
        -   Convertible RIs (Up to 54% off on-demand) features the capability to change the attributes of the RI as long as the exchange results in creation of Reserved instances of equal or greater value
        -   Scheduled RIs are available to launch within the time window you reserve. This option allows you to match your capacity reservation to a predictable recurring schedule that only requires a fraction of a day, a week, or a month
-   **Spot** - enables you to bid whatever proce you want for instance capacity, providing for even greated savings if your applications have flexible start and end times
    -   applications that have flexible start and end times
    -   applications that are only feasible at very low compute prices
    -   users with an urgent need for large amounts of additional computing capacity
    -   if a Spot instance is terminated by Amazon EC2, you will **not** be charged for a partial hour of usage, however, if you terminate the instance yourself, you will be charged for the complete hour in which the instance ran
-   **Dedicated Hosts** - Physical EC2 server dedicated for your use. Dedicated Hosts can help you reduce costs by allowing you to use your existing server-bound software licences.
    -   useful for regulatory requirements that may not support multi-tenant virtualization
    -   great for licencing witch does not support multi-tenancy or cloud deployments
    -   can be purchased On-Demand (hourly)
    -   can be purchased as a reservation for up to 70% off the On-Demand price

# Instance Types

-   **F** _Field Programmable Gate Array_ - genomics research, financail analytics, real-time video processing, big data etc. (**F for FPGA**)
-   **I** _High Speed Storage_ - NoSQL DBs, Data Warehousing etc. (**I for IOPS**)
-   **G** _Graphics Intensive_ - Video Encoding / 3 application streaming (**G for Graphics**)
-   **H** _High Disk Throughput_ MapReduce-based workloads, distributed file systems such as HDFS and MapR-FS (**H for high dist throughputs**)
-   **T** _Lower Costm General Purpose_ - Web Servers / Small DBs (**T for cheap general purpose**)
-   **D** _Dense Storage_ - fileservers / Data Warehousing / Hadoop (**D for Density**)
-   **R** _memory optimized_ - Memory Intesive Apps/DBs (**R for RAM**)
-   **M** _General Purpose_ - Application Servers (**M for main choice for general purpose apps**)
-   **C** _Compute Optimized_ - CPU Intensive Apps/DBs (**C for Compute**)
-   **P** _Graphics/General Purpose GPU_ - Machine Learning, Bit Coin Mining etc. (**P for pics - Graphics**)
-   **X** _Memory optimized_ - SAP HANA/Apache Spark etc. (**X for Extreme Memory**)

# EBS

Amazon EBS allows you to create storage volumes and attach them to Amazon EC2 instances. Once attached, you can create a file system on top of these volumes, run a database, or use them in any other way you would use a block device. Amazon EBS volumes are placed in a specific Availability Zone, where they are automatically replicated to protect you from the failures of a single component.

## Types

-   **General Purpose SSD (GP2)**
    -   General purpose, balances both price and preformance
    -   ratio of 3 IOPS per GB with up to 10,000 IOPS and the ability to burst up to 3000 IOPS for extended periods of time for volumes at 3334 GiB and above
-   **Provisioned IOPS SSD (IO1)**
    -   designed for I/O intensive applications such as large relational or NoSQL databases
    -   use if you need more than 10,000 IOPS
    -   can provision up to 20,000 IOPS per volume
-   **Throughput Optimized HDD (ST1)**
    -   big data
    -   data warehouses
    -   log processing
    -   cannot be a boot volume
-   **Cold HDD (SC1)**
    -   lowest cost storage for infrequently accessed workloads
    -   file server
    -   cannot be a boot volume
-   **Magnetic (Standard)**
    -   lowest cost per gigabyte of all EBS volume types that is bootable. Magnetic volumes are ideal for workloads where data is accessed infrequently, and applications where the lowest storage cost is important

# Instances

-   termination protection is turned off by default, you must turn it on
-   on an EBS-backed instance, the default action is for the root EBS volume to be deleted when the instance is terminated
-   EBS Root Volumes of your DEFAULT AMI's cannot be encrypted. You can also use a third party tool (such as bit locker etc) to encrypt the root volume, or this can be done when creating AMI's in the AWS console or using the API
-   additional volumes can be encrypted

# Apache Web Server on EC2

First, we need to launch EC2 instance. Let's choose Amazon Linux 2 AMI and use the default settings.

In step - Configure Security Group, we need to add rule for HTTP protocol (optionally for HTTPS).

After that, we need to create new key pair and store it. We will need this key pair to log in to our newly created instance. Once we finish configuation process, we need to wait until the instance state turns into _running_.

Next step is to change permissions on our key pair.

`chmod 400 keypairfile.pem`

If we are on linux distrubution, we can use SSH from terminal to gain access to our running instance. We need to provide default user name (`ec2-user` in case of Amazon Linux 2 AMI, `ubuntu` in case of ubuntu etc.), public ip address of the instance (can be found under _Description_ of EC2 instance) and the obtained _pem_ file.

`ssh ec2-user@instance_public_ip -i keypairfile.pem`

Once we are inside of the instance, we can install apache webserver

`sudo yum install httpd`

The root webpage file (_index.html_) should be placed to `/var/www/html`

`cd /var/www/html`

This folder should be empty by default. Let's create simple _index.html_ file inside of it (we should have access to _nano_ which we can use to create that file).

`sudo nano index.html`

```html
<html>
	<body>
		<h1>Hello World!</h1>
	</body>
</html>
```

Once we have created the above _index.html_ file, we can launch our webserver.

`sudo service httpd start`

To reach our website, we need to obtain _public DNS_ of the instance which can be located in the same place as the _public ip_ that we have used to log in to the instance (_EC2 -> Instances -> Description -> Public DNS (IPv4)_). If we copy that address and open it in a browser, we should see our webpage.

If we want `httpd` start automatically each time the instance is restarted we can use the following command.

`sudo chkconfig httpd on`

# Security Groups

-   changes to security groups are applied immediatelly
-   all outbound traffic is allowed
-   secuity groups are **STATEFULL** - everything that we allow to come in (_inbound rules_) is automatically allowed to go out (_outbound rule_) event if we did not specify any _outbound_ rules
-   all inbound traffic is blocked by default
-   we can have any number of EC2 instances within a security group
-   we can have multiple security groups attached to EC2 instance (there can't be any conflicts there because we can specify only allow rules)
-   we cannot block specific IP addresses using Security Groups, instead use Network Access Control Lists
-   we can specify allow rules, but not deny rules

# Volumes and Snapshots

-   volumes exist on EBS
    -   virtual hard disk
-   snapshots exist on S3
-   snapshots are point in time copies of Volumes
-   snapshots are incremental - this means that only the blocks that have changed since our last snapshot are moved to S3
-   if it is a first snapshot, it can take some time to create
-   to create a snapshot for Amazon EBS volumes that serve as root devices, we should stop the instance before taking the snapshot (however we can take a snap while the instance is running)
-   we can create AMI's (Amazon Machine Images) from EBS-backed Instances and Snapshots
-   we can change EBS volume size on the fly, including changing the size and storage type
-   volumes will **ALWAYS** be in the same availability zone as EC2 instance (we can't have volume in one AZ and EC2 Instance in another AZ, that would not work due to latency)
-   to move an EC2 volume from one AZ/Region to another, take a snap or create an AMI of it, then copy it to the new AZ/Region
-   snapshots of encrypted volumes are encrypted automatically
-   volumes restored from encrypted snapshots are encrypted automatically
-   we can share snapshots, but only if they are unencrypted

    -   there snapshots can be shared with other AWS accounts or made public

## RAID

RAID - Redundant Array of Independent Disks

-   RAID 0 - Striped, No Redundancy, Good performance
-   RAID 1 - Mirrored, Redundancy
-   RAID 5 - Good for reads, bad for writes, AWS does not recommend ever putting RAID 5's on EBS
-   RAID 10 - Striped and Mirrored, good redundancy, good performance

Problem - Take a snapshot, the snapshot excludes data held in the cache by applications and the OS. This tends not to matter on a single volume, however using multiple volumes in a RAID array, this can be a problem due to interdependencies of the array.

Solution - Take an application consistent snapshot.

-   Stop the application from writing to disk
-   flush all caches to the disk

How can we do that?

-   freeze the file system **or**
-   unmount the RAID array **or**
-   shutting down the associated EC2 instance

-   To create a snapshot from EBS volumes that serves as root device, we should stop the instance before taking the snapshot

## EBS vs Instance Store

-   All AMIs are categorized as either backed by Amazon EBS or backed by Instance Store
-   for EBS Volumes: The root device for an instance launched from the AMI is an Amazon EBS volume created from an Amazon EBS snapshot
-   for Instance Store Volumes: The root device for an instance launched from the AMI is an instance store volume created fron a template stored in Amazon S3

-   Instance Store Volumes are sometimes called Ephemeral Storage
-   Instance Store Volumes cannot be stopped. If the underlying host fails, we will lose our data
-   EBS backed instances can be stopped. We will not lose our data on this instance if it is stopped.
-   We can reboot both, we will not lose our data.
-   By default, both ROOT volumes will be deleted on termination, however with EBS volumes, we can tell AWS to keep the root device volume.

# Load Balancers

types:

-   application load balancer
-   network load balancer
-   classic load balancer

## Application Load Balancer

Are best suited for load balancing of HTTP and HTTPS traffic. They operate at Layer 7 and are application-aware. They are intelligent, and you can create advanced request routing, sending specified requests to specific web servers.

## Network Load Balancer

Are best suited for load balancing of TCP traffic where extreme performance is required. Operating at the connection level (Layer 4), Network Load Balancers are capable of handling millions of requests per second, while maintaining ultra-low latencies.

Used for extreme performance.

## Classic Load Balancer

Are the legacy _Elastic Load Balancers_. We can load balance HTTP/HTTPS applications and use Layer 7-specific features, such as _X-Forwarded-For_ and sticky sessions. We can also use strict Layer 4 load balancing for applications that rely purely on the TCP protocol.

## Load Balancer Errors

If our application stops responding, the ELB (Classic Load Balancer) responds with 504 error (status code)

This means that the application is having issues. This could be either at the Web Server layer or at the Database Layer.

Identify where the application is failing, and scale it up or out where possible.

-   504 error means that the gateway has timed out, this means that the application is not responding within the idle timeout period
    -   troubleshoot the application, is it the webserver or database?
-   If we need the IPv4 address of our end user, we need to look for the _X-Forwarded-For_ header (our application will see requests comming from IP address of our Load Balancer, not our user)
-   Instances monitored by ELB are reported as: _InService_ or _OutOfService_
-   Health Checks check the instance health by talking to it
-   Have their own DNS name, we are never given an IP address

# Cloud Watch

-   Standard Monitoring - 5 min
-   Detailed Monitoring - 1 min

-   **Dashboards** - Creat dashboards to see what is happening with our AWS environment
-   **Alarms** - Allows us to set Alarms that notify us when particular thresholds are hit
-   **Events** - CloudWatch Events helps us to respond to state changes in our AWS resources (eg. EC2 instance comes live -> lamba function is triggered -> updates DNS)
-   **Logs** - CloudWatch Logs helps us to aggregate, monitor, and store logs (by installing CloudWatch agent on our instance)

**CloudWatch** is for performance monitoring of our AWS resources, **CloudTrail** is for auditing - what people are doing with our AWS account (eg. new IAM role has been created)

# Instance Metadata

To access metadata from within the instance, use the following command

`curl http://169.254.169.254/latest/meta-data/`

or to access user defined starting script

`curl http://169.254.169.254/latest/user-data/`

# Placement Groups

types:

-   Clustered Placement Group
-   Spread Placement Group

## Clustered Placement Group

Is a grouping of instances within a single Availability Zone. Placement groups are recommended for applications that need low network latency, high network throughput, or both.

Only certain instances can be launched in to a Clustered Placement Group.

## Spread Placement Group

Is a group of instances that are each placed on distinct underlying hardware. Spread Placement Groups are recommended for application that have a small number of critical instances that should be kept separate from each other.

-   a clustered placement group can't span multiple Availability Zones
-   a spread placement group can span multiple Availability Zones
-   the name you specify for a placement group must be unique within your AWS account
-   only certain types of instances can be launched in a placement group (Compute Optimized, GPU, Memory Optimized, Storage Optimized)
-   AWS recommed homogenous instances within placement groups
-   we can't merge placement groups
-   we can't move an existing instance into a placement group, we can create an AMI from our existing instance, and then launch a new instance from the AMI into a placement group

# Review

EC2 pricing types

-   on demand
-   spot
    -   if you terminate the instance, you pay for the hour
    -   if AWS terminates the spot instance, you get the hour it was terminated in for free
-   reserved
-   dedicated hosts

EBS types

-   SSD, general purpose - GP2 (up to 10,000 IOPS)
-   SSD, provisioned IOPS - IO1 (more than 10,000)
-   HDD, throughtput optimized - ST1 - frequently accessed workloads
-   HDD, cold - SC1 - less frequently accessed data
-   HDD, magnetic - standard - cheap, infrequently accessed storage

-   HDD throughput optimized and HDD cold can't be used as boot volumes
-   you can't mount 1 EBS volume to multiple EC2 instance, instead use EFS (or use S3)
-   termination protection is turned off by default, you must turn it on
-   on EBS-backed instances, the default action is for the root volume to be deleted when the instance is terminated
-   EBS-backed root volumes can now be encrypted using AWS API or console, or you can use a third party tool (such as bit locker) to encrypt the root volume
-   additional volumes can be encrypted

volumes vs snapshots

-   volumes exist on EBS - virtual hard disk
-   snapshots exist on S3
-   you can take a snapshot of a volume, this will store that volume on S3
-   snapshots are point in time copies of volumes
-   snapshots are incremental, this meanst that only block that have changed since your last snapshot are moved to S3
-   it this is your first snapshot, it may take some time
-   snapshots of encrypted volumes are encrypted automatically
-   volumes restored from encrypted snapshots are encrypted automatically
-   you can share snapshots, but only if they are unencrypted
    -   these snapshots can be shared with other AWS accounts or made public
-   to create a snapshot for Amazon EBS volumes that serve as root devices, you should stop the instance before taking the snapshot

EBS vs instance store

-   instance store volumes are sometimes called ephemeral storage
-   instance store volumes cannot be stopped, if the underlying host fails, you will lose your data
-   EBS backed instances can be stopped, you will not lose the data on this instance if it is stopped
-   you can reboot both, you will not lose your data
-   by default, both ROOT volumes will be deleted on termination, however with EBS volumes, you can tell AWS to keep the root device volume

AMI

-   AMIs are regional
-   you can only launch an AMI from the region in which it is stored, however you can copy AMIs to other regions using console, command line or the Amazon EC2 API

Monitoring

-   standard - 5 minutes
-   detailed - 1 minute
-   CloudWatch is for performance monitoring
    -   Dashboards - CloudWatch creates dashboards to see what is happening with your AWS environment
    -   Alarms - Allows you to set alarms that notify you when particular thresholds are hit
    -   Events - CloudWatch Events help you to respond to state changes in your AWS resources
    -   Logs - CloudWatch Logs help you to aggregate, monitor and store logs
-   CloudTrail is for auditing

Roles

-   roles are more secure than storing your access key and secret access key on indivicual EC2 instances
-   roles are easier to manag
-   roles can be assigned to an EC2 instance AFTER it has been provisioned using both the command line and AWS console
-   roles are universal - you can use them in any region

Instance Meta-data

-   used to get information about an instance (such as public ip)
-   `curl http://169.254.169.254/latest/meta-data/`
-   `curl http://169.254.169.254/latest/user-data/`

EFS

-   support the Network File System version 4 (NFSv4)
-   you only pay for the storage you use (no pre-provisioning required)
-   can scale up to the petabytes
-   can support thousands of concurrent NFS connections
-   data is stored across multiple AZs within a region
-   read after write consistency

Placement groups

-   clustered placement group
-   spred placement group
