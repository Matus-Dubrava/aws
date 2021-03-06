-   [EC2](#ec2)
-   [Instance Types](#instance-types)
-   [EBS](#ebs)
    -   [Volumes and Snapshots](#volumes-and-snapshots)
    -   [Types](#types)
    -   [EBS Backed vs Instance Store](#ebs-backed-vs-instance-store)
-   [AMI](#ami)
-   [Instances](#instances)
-   [Apache Web Server on EC2](#apache-web-server-on-eC2)
    -   [Using ssh config](#using-ssh-config)
-   [Security Groups](#security-groups)
-   [Load Balancers](#load-balancers)
-   [Cloud Watch](#cloud-watch)
-   [Instance Metadata](#instance-metadata)
-   [Instance User Data](#instance-user-data)
-   [Placement Groups](#placement-groups)
-   [Public and Private IP](#public-and-private-ip)
-   [Elastic IP](#elastic-ip)
-   [Auto Scaling](#auto-scaling)
-   [Hypervisors](#hypervisors)
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

-   in case of **on demand** pricing model, we do **not** pay for instance if it is stopped (we will still pay for EBS volumes attached to that instance as well as for unused Elastic IP)

# Instance Types

Instances have 5 distinct characteristics adverised on the website

-   RAM (type, amount, generation)
-   CPU (type, make, frequency, generation, number of cores)
-   I/O (disk performance, EBS optimizations)
-   Network (network bandwidth, network latency)
-   Graphical Processing Unit (GPU)

## RAM

-   RAM (random access memory) is the computer "hot" memory
-   it is different from Disk, which is the computer "cold" memory
-   RAM is meant as an "speed-up" in a computer
    -   it is very expensive
    -   it is very fast
    -   it is often used to cache objects
-   RAM gets emptied and lost at each machine's reboot
-   a small amount of RAM is used by the OS and the running applications
-   you can use `top` command to find the current amount of RAM being used
-   an in-memory bug data frameworks such as _Apache Spark_ will use a lot of RAM

-   if the RAM is not large enough, you will either get

    -   OutOfMemory error
    -   the RAM will extend to the disk (which is way slower). it is called swapping
    -   if your RAM is swapping, perforamnce may degrade considerably

-   some EC2 instances come with a lot of RAM
-   these machines are _R_ generation or _X_ generation
-   you should use them if your application requires a lot of memory
-   the best way to monitor memory usage is with `top` command or `free -m` command

## CPU

The central processing unit (CPU) of a computer is a piece of hardware that carries out the instructions of a computer program. It performs the basic arithmetical, logical, and input/output operations of a computer system.

CPU components:

-   The CPU can be made of mutiple cores. Each core is independent, which enables multi-tasking.
-   The CPU has a frequency, which represents how fast it rotates, the higher the better

Anytime your server needs to perform a computation, or an instruction, the CPU will be used.

-   CPU is always active, as your computer always processes some action
-   you can use `top` command to find the current amount of CPU being used
-   in Linux, each core will account for 100%, if you have 4 cores, all the cores are used when CPU usage is 400%
-   if CPU is not fast enough or does not have enough cores, you will get

    -   CPU usage of each core at 100%
    -   the server will seriously slow down

-   some EC2 instance have optimized CPU for frequency or # of cores (vCPU)
-   these machines are **C** generation
-   you should use them if your application requires multi-thrading or a very fast processor

## IO

Some EC2 instances come with attached disks or optimisations to read from EBS volumes.

-   These instances are **I** generation - SSD backed instance storage optimized for low latency, very high random I/O performance, high sequential read throughput and provide high IOPS at a low cost (good for ElasticSearch, NoSQL databases, analytics workloads...)
-   other instances are of **H** or **D** type (MapReduce, HDFS, Big Data, Kafka)

## GPU

Most EC2 instances do not ome with a GPU

The onse that come with GPU are - P-generation - G-generation

### Example 1

Your application is meant to remember an entire English dictionary and find definitions for words very quickly

-   the dictionary lives on disk, but will be loaded in RAM when your application starts
-   the English dictionary is big, so you will need a lot of RAM
-   when your application will look up a word, it will be very quick

-   _increasing RAM for this application will help if the dictionary gets bigger_
-   _adding more powerfull CPU or more CPU cores will not help in this situation_
-   _the IO may help at application start-up (a lot of read operations need to happen very fast) but then the IO will be unused_

### Example 2

Your application needs to compute the value of PI (3.14..) with a lot of precision

-   the formula for PI does not require the computer to load much stuff into RAM
-   the formula for PI is iterative and we only care about the last result, the others being discarded
-   in this case, very little RAM will be used

-   _increasing the RAM when running this application will have no effect_
-   _adding more powerfull CPU will help (adding additional cores will help only if the algorithm can be run in parallel)_
-   _optimized IO will have no effect in this case_

## Burstable instances (T2)

-   AWS has the concept of burstable instances (T2 machines)
-   burst means that overall, the instance has OK CPU performance
-   when the machine needs to process something unexpected (a spike in load of example), it can burst and CPU can be VERY good
-   if the machine bursts, it utilizes "burst credits"
-   if all the burst creadits are gone, the CPU becomes BAD
-   if the machine stops bursting, creadits are accumulated over time

### T2 unlimited

-   you pay extra money if you go over your credit balance, but you don't lose in performance

## EC2 instance familes

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

## Volumes and Snapshots

-   volumes exist on EBS - virtual hard disk

-   snapshots exist on S3
-   snapshots are point in time copies of Volumes
-   snapshots only take the actual space of the blocks on the volume
    -   if you snapshot a 100 GB drive that only has 5 GB of data, then your EBS snapshot will only be 5 GB
-   snapshots are incremental - this means that only the blocks that have changed since our last snapshot are moved to S3
-   if it is a first snapshot, it can take some time to create
-   to create a snapshot for Amazon EBS volumes that serve as root devices, we should stop the instance before taking the snapshot (however we can take a snap while the instance is running)

-   we can create AMI's (Amazon Machine Images) from EBS-backed Instances and Snapshots
-   we can change EBS volume size on the fly, including changing the size and storage type, but we can only increase the size (if we want to decrease a size of volume -> we need to create a snapshot of that volume and then create a volume from this snapshot with desired, possibly lower, size)

    -   size (for any volume type)
    -   IOPS (inly for _IO1_ type)

-   volumes will **ALWAYS** be in the same availability zone as EC2 instance (we can't have volume in one AZ and EC2 Instance in another AZ, that would not work due to latency)
-   to move an EC2 volume from one AZ/Region to another, take a snap or create an AMI of it, then copy it to the new AZ/Region
-   snapshots of encrypted volumes are encrypted automatically
-   volumes restored from encrypted snapshots are encrypted automatically
-   we can share snapshots, but only if they are unencrypted

    -   there snapshots can be shared with other AWS accounts or made public

## Types

-   **General Purpose SSD (GP2)**

    -   General purpose, balances both price and preformance
    -   ratio of 3 IOPS per GB with up to 10,000 IOPS and the ability to burst up to 3000 IOPS for extended periods of time for volumes at 3334 GiB and above
    -   recommended for most workloads
    -   good for
        -   system boot volumes
        -   virtual desktops
        -   low-latency interactive apps
        -   development and test environments
    -   1 GB - 16 TB

-   **Provisioned IOPS SSD (IO1)**

    -   designed for I/O intensive applications such as large relational or NoSQL databases
    -   use if you need more than 10,000 IOPS
    -   can provision up to 20,000 IOPS per volume
    -   4GB - 16GB

*   **Throughput Optimized HDD (ST1)**

    -   streaming workloads requiring consistent, fast throughput at a low price
    -   big data
    -   data warehouses
    -   log processing
    -   500 GB - 16 TB
    -   max IOPS is 500 - this is not a disk for lots of random reads/writes operations, this is for long continuous reads/writes
    -   cannot be a boot volume

*   **Cold HDD (SC1)**

    -   throughput-oriented storage for large volumes of data that is infrequently accessed
    -   lowest cost storage for infrequently accessed workloads
    -   file server
    -   500 GB - 16 TB
    -   max IOPS is 250
    -   max throughput is 250 MB/s - can burst
    -   cannot be a boot volume

*   **Magnetic (Standard)**
    -   lowest cost per gigabyte of all EBS volume types that is bootable. Magnetic volumes are ideal for workloads where data is accessed infrequently, and applications where the lowest storage cost is important

## EBS Backed vs Instance Store

-   EBS backed volumes are persistent
-   instance store backed volumes are not presistent (they are ephemeral)
-   EBS Volumes can be detached and reattached to other EC2 instances

-   instance store volumes cannot be detached and reattached to other instances - they exist only for the life of that instance
-   EBS volumes can be stopped, data will persist

-   instance store volumes cannot be stopped - if you do this the data will be wiped
-   EBS backed = store data long term
-   instance store = shouldn't be used for long-term data storage

# AMI

Image to use to create our own instances for Linux or Windows.

Using a custom AMI can provide the following advantages

-   pre-installed packaged
-   faster boot time (no need to wait for user data (bootstrap script) to run)
-   security concerns - control over the machines in the network
-   Active Directory Integration out of the box
-   installing our apps ahead of time (for faster deploy when auto-scaling)
-   using someone else's AMI that is optimized for running an app, DB, etc..

-   we can leverage AMIs from other pople
-   we can also pay for other people's AMI by the hour (plus the charges associated with the EC2 instance on which we will run the AMI)
    -   these people have otimized the software
    -   the machine is easy to run and configure
    -   you basically rend 'expertise' from the AMI creator

AMI can be found and published on the Amazon Marketplace

## AMI Storage

-   AMI's take space and they live in Amazon S3, so you get charged for the actual space it takes in Amazon S3
-   Amazon S3 is durable, cheap and resilient storage where most of your backups will live (but you won't see them in the S3 console)
-   by default, your AMIs are private, and locked for your account / region
-   you can also make your AMIs public and share them with other AWS accounts or sell them on the AMI Marketplace

**Warning**

-   do not use an AMI that you don't trust
-   some AMIs might come with malware or may not be secure for your enterprise

**important** AMI's are build for a specific region, but we can always copy an AMI across regions

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

## Using ssh config

If we have an instance with public DNS name or public IP address, we can create ssh config file with appropriate entry to simplify process of establishing connection with our instance.

To create the ssh config file, go to `~/.ssh` and edit `config` file (or create one if it doesn't exist)

Let's assume that the default username for our EC2 instance is `ec2-user`, its public DNS name is `ec2-52-91-233-70.compute-1.amazonaws.com`, and we will create a new name for that host - `my-ec2-instance`. In addition to the above information, we will need a keypair for that EC2 instance (`.pem` file). Let's assume that we have stored the file containing the key as `mykeypair.pem` in `~/SSH` folder. All we need to do now is to add new entry to the `config` file.

```sh
Host my-ec2-instance
    Hostname ec2-52-91-233-70.compute-1.amazonaws.com
    User ec2-user
    IdentityFile ~/SSH/mykeypair.pem
```

Now, instead of typing the whole `ssh` command, we can do this:

`ssh my-ec2-instance`

# Security Groups

-   changes to security groups are applied immediatelly
-   all outbound traffic is allowed
-   secuity groups are **STATEFULL** - everything that we allow to come in (_inbound rules_) is automatically allowed to go out (_outbound rule_) event if we did not specify any _outbound_ rules
-   all inbound traffic is blocked by default
-   we can have any number of EC2 instances within a security group
-   we can have multiple security groups attached to EC2 instance (there can't be any conflicts there because we can specify only allow rules)
-   we cannot block specific IP addresses using Security Groups, instead use Network Access Control Lists
-   does
-   we can specify allow rules, but not deny rules
-   security groups are locked to region/VPC, if we want to have the same security group in multiple regions, we need to create it in each one of them separatelly
-   security groups live outside the EC2 instances - if traffic is blocked by it, the EC2 instance will not see it
-   if there is some problem with connecting to our instance, it is **ALWAYS** a good idea to start troubleshooting by checking security groups
    -   if your application is not accessible (time out), then it's most likely a security group issue
    -   if your application gives a _connection refused_ error, then it's an application error (or the application hasn't started yet)
    -   _we can't SSH to our instance - check whether the associated security groups contains rule that allows SSH protocol on port 22 for our IP address_
    -   _we can't connect our EFS (Elastic File System) - check whether NFS protocol (port 2049) is allowed_

## Referencing other security groups

-   It is possible to have security group rules using other security groups instead of IP ranges (CIDR)
-   this is for enhanced security in AWS
-   the security group can even reference itself

Use cases:

-   EC2 to EC2 direct communication within security group
-   public load balancer => private EC2 instance
-   having rules more flexible than fixed IP ranges (IPs can change)

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

Load balancer are servers that forward internet traffic to multiple servers (EC2 instances)

-   spread load acrowss multiple donwstream instances
-   expose single point of access (DNS) to your application
-   seamlessly handle failures of downstream instances
-   do regular health checks of your instances
-   provide SSL termination (HTTPS) for your website
-   enforce stickiness with cookies (same user goes to the same EC2 instance)
-   high availability across zones
-   separate public traffic from private traffic

-   you can setup _internal (private)_ or _external (public)_ ELBs

types:

-   application load balancer
-   network load balancer
-   classic load balancer

## Application Load Balancer

Are best suited for load balancing of HTTP and HTTPS traffic. They operate at Layer 7 and are application-aware. They are intelligent, and you can create advanced request routing, sending specified requests to specific web servers.

-   load balancing to multiple HTTP applications across instances (target groups)
-   load balancing to multiple applications on the same instance (ie containers)
-   load balancing based on route in URL
    -   _www.example.com/users -> target group1_
    -   _www.example.com/search -> target group2_
-   load balancing based on hostname in URL

Basically, they are good for micro services and container-based applications (ie Docker)

-   considering classic load balancers, we would need to create one load balancer per application

In case of using SSL/TLS encryption combined with application load balancer, ALB needs to store private and public key of the server for which the connection is targeted because it operates at layer 7, which means that it needs to decrypt the data (ALB needs to read details of the HTTP request). After that, we can choose whether ALB will encrypt the data again and send it encrypted, or send them in plain form. If we choose to send unencrypted data from ALB to EC2 instance, ALB will offload some work from EC2, but if we choose for ALB to ecrypt the data again, it will increase latency of the communication.

ALB may not be the best option if we need _end-to-end_ encryption.

## Network Load Balancer

Are best suited for load balancing of TCP traffic where extreme performance is required. Operating at the connection level (Layer 4), Network Load Balancers are capable of handling millions of requests per second, while maintaining ultra-low latencies.

-   forward TCP traffic to your instances
-   handle millions for requests per second
-   support for static IP or Elastic IP
-   less latency ~ 100 ms (vs 400 ms for ALB)
-   network load balancers are mostly used for extreme performance and should not be the default load balancer you choose

If we are not using HTTP protocol for communication (may be the case for some multiplayer games etc.) then we cannot use Application Load Balancer, so Network Load Balancer is a good choice.

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

## Considerations

-   if you need to support static or Elastic IP address: use Network Load Balancer
-   if you need control over your SSL cipher: use Classic Load Balancer
-   if using container services and/or ECS: use ALB or NLB
-   if you need to support SSL offloading: use ALB or CLB

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

# Instance User Data

-   it is possible to boostrap our instances using an EC2 User Data script
-   bootstaping means launching commands when a machine starts
-   that scipt is only run once at the instance first start
-   EC2 user data is used to automate boot tasks such as:
    -   installing updates
    -   installing software
    -   downloading common files from the internet or S3 bucket

To access user defined script from within the instance:

`curl http://169.254.169.254/latest/user-data/`

Example script that automatically applies updates, installs httpd, launch httpd, and create a simple index.html file that will be automatically served by apache server that we have installed

```sh
#!/bin/bash
yum update -y
yum install httpd -y
service httpd start
chkconfig httpd on
cd /var/www/html
echo "simple website text" > index.html
```

If something goes wrong with this script, we can access system log by clicking on _instance settings -> get system log_

# Placement Groups

If we need to have control over EC2 instance placement strategy we can
use _Placement Groups_.

types:

-   Clustered Placement Group
-   Spread Placement Group

## Clustered Placement Group

Is a grouping of instances within a single Availability Zone. Placement groups are recommended for applications that need low network latency, high network throughput, or both.

Only certain instances can be launched in to a Clustered Placement Group.

-   same rack, same AZ

-   pros: Great network (10 Gbps bandwidth between instances)
-   cons: if the rack fails, all instances fail at the same time
-   use case:
    -   big data job that needs to complete fast
    -   application that needs extremely low latency and high network throughput

## Spread Placement Group

Is a group of instances that are each placed on distinct underlying hardware. Spread Placement Groups are recommended for application that have a small number of critical instances that should be kept separate from each other.

-   pros:
    -   can span accross AZs
    -   reduced risk of simultaneous failure
    -   EC2 instances are on different physical hardware
-   use case:

    -   application that need to maximize high availability
    -   Cassandra Cluster, Kafka Cluster, Web application that is distributed

-   max 7 instances per group per AZ

## cont.

-   a clustered placement group can't span multiple Availability Zones
-   a spread placement group can span multiple Availability Zones
-   the name you specify for a placement group must be unique within your AWS account
-   only certain types of instances can be launched in a placement group (Compute Optimized, GPU, Memory Optimized, Storage Optimized; not applicable to T2 instances)
-   AWS recommed homogenous instances within placement groups
-   we can't merge placement groups
-   we can't move an existing instance into a placement group, we can create an AMI from our existing instance, and then launch a new instance from the AMI into a placement group

# Public and Private IP

Networking has two sorts of IPs. IPv4 and IPv6 where IPv4 is still the most common format used online. IPv^ is newer and solves problems for the Internet of Things (IoT).

IPv4 allows for 3.7 billion different addresses in the public space, format of IPv4 is [0-255].[0-255].[0-255].[0-255] (ie `1.160.10.240`).

Public IP addresses must be unique across the whole internet, there can't be two network nodes using the same IP address.
Private IP addresses must be unique only within a private network, there can't be two network nodes using the same IP address within the same private network but there can be any number of private networks having a network node with the same IP address.

We can't access node via its private address from the outside of the private network which it sits in. If that node needs to communiacate with the internet, or another network, it does so via _Internet Gateway_ which has a public address associated with it.

-   by default, our EC2 instances comes with

    -   a private IP for the internal AWS Network
    -   public IP for www

-   when we are connecting to our instance using SSH (from our computer), we can't use the instance's private IP address, because our computer from which we are issuing SSH command doesn't sit inside of AWS private network (obviously)
-   so we can only use the instance's public IP address or public DNS name
-   if we are inside of EC2 instance, we can use private IP address of other EC2 instance to connect to it
-   public address may change if we stop and start our EC2 instance, but its private IP address stays the same

-   **important** if our EC2 instance is stopped and then started again, public address associated with it **can change** (but it does **not** change if we reboot the instance)

We can test whether our instance is publicly accessible by pinging it

`ping <public-ip-address-or-DNS-name-of-the-instance>`

but be sure to add rule - type: `Custom ICMP`, protocol: `Echo Request` to the instance's security group, otherwise we will not be able to ping it.

## Allowed ranges

Private IP can only allow certain ranges

-   10.0.0.0 - 10.255.255.255 (10.0.0.0/8) - in big networks
-   172.16.0.0 - 172.31.255.255 (172.16.0.0/12) - default AWS
-   192.168.0.0 - 192.168.255.255 (192.168.0.0/16) - home networks

All the rest of the IP on the internet are public IP

-   security groups works the same with both public and private IPs

## CIDRs, Subnet Masks

The subnet masks basically allows part of the underlying IP to get additional next values from the base IP

-   /32 allows for 1 IP
-   /31 allows for 2 IP
-   /30 allows for 4 IP
-   /29 allows for 8 IP
-   /28 allows for 16 IP
-   /16 allows for 65,536 IP
-   /0 allows for all IP

-   /32 - no IP number can change
-   /24 - last IP number can change
-   /16 - last two IP numbers can change
-   /8 - last three IP numbers can change
-   /0 - all IP numbers can change

### Examples

-   192.168.0.0/24 => 192.168.0.0 - 192.168.0.255 (256 IPs)
-   192.168.0.0/16 => 192.168.0.0 - 192.168.255.255 (65,536 IPs)
-   134.56.78.123/32 => just 134.56.78.123 (1 IP)
-   0.0.0.0/0 => all IPs

# Elastic IP

-   when you stop and then start an EC2 instance, it can change its public IP
-   if you need to have a fixed public IP for your instance, you need Elastic IP
-   Elastic IP is a public IPv4 IP you own as long as you don't delete it
-   you can attach it to one instance at a time
-   with an Elastic IP addres, you can mask failure of an instance or software by rapidly remapping the address to another instance in your account
-   you can only have 5 Elastic IP in your account (but you can ask AWS to increase that number)
-   overall, try to avoid using elastic IP
    -   they often reflect poor architectural decisions
    -   instead, use random public IP and register a DNS name to it
    -   use Load Balancer with just pivate IPs of EC2 instances

pricing - as long as the elastic IP is attached to a running instance, you are not paying for it

# Auto Scaling

In real-life, the load on your website and application can change. In the cloud, you can create and get rid of servers very quickly.

The goal of an Auto Scaling Group (ASG) is to

-   scale out (add EC2 instances) to match an increased load
-   scale in (remove EC2 instances) to match a decreased load
-   ensure we have a minimum and a maximum number of instances running
-   automatically register new instances to a load balancer

attributes of ASG

-   launch configuration
    -   AMI + Instance type
    -   EC2 user data
    -   EBS volumes
    -   security groups
    -   SSH key pair
-   min size / max size / initial capacity
-   network + subnets information
-   load balancer information
-   scaling policies

## Auto Scaling Alarms

-   it is possible to scale an ASG based on CloudWatch alarms
-   an alarm monitors a metric (such as average CPU usage)
-   metrics are computed for the overall ASG instances
-   based on the alarm
    -   we can create scale-out policies (increase number of instances)
    -   we can create scale-in policies (decrease number of instances)

It is possible to define "better" (newer feature) auto scaling rules that are directly managed by EC2 (not based on alarms, and you don't have to say how many instance to add or remove)

-   average CPU usage
-   number of requests on the ELB per instance
-   average network in
-   average network out

# Hypervisors

EC2 uses two types of hypervisors
-   __Xen Hypervisor__
    -   Amazon uses a customized Xen Hypervisor
    -   physical host resources are used by hypervisor
-   __Nitro__
    -   Amazon's custom hardware assisted virtualizatio
    -   light weight virtualization sofrware (derived from Linux KVM)
    -   almost all resources of pyhisical host available to guest
 

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
