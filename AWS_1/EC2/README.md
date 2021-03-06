-   [EC2](#ec2)
    -   [Families](#families)
    -   [EBS](#ebs)
        -   [EBS Optimized Instances](#ebs-optimized-instances)
    -   [Enhanced Networking](#enhanced-networking)
    -   [Placement Groups](#placement-groups)
    -   [Status Checks](#status-checks)
    -   [Instance states](#instance-states)
    -   [Instance metadata](#instance-metadata)
    -   [VM import export](#vm-import-export)
    -   [IAM roles](#iam-roles)
    -   [Bastion Host](#bastion-host)
    -   [Purchasing Options](#purchasing-options)
    -   [ENI](#eni)
    -   [source destination check](#source-destination-check)
    -   [Troubleshooting](#troubleshooting)

# EC2

-   EC2 service provides resizable compute capacity in the cloud
-   you have root access to each of your EC2 instancec
-   you can stop, restrat, reboot, or terminate your instances
-   EC2 availability SLA (service level agreement) is 99.95% for each region during any monthly billing period
    -   ~22 minutes per month
-   you can provision your EC2 instances on shared or dedicated hosts (physical servers)

-   to access an instance you need a key and key pair name

    -   when you launch a new EN2 instance, you can create a public/private key pair
    -   you can download the private key only once
        -   save it in a safe place so you won't loose it
    -   the public key is saved by AWS to match it to the key pair name, and private key when you try to login to the EC2 instance
    -   if you launch your instance without a key pair, you will not be able to access it (via RDP or SSH)

-   two types or Block store devices are supported:

    -   EBS (Elastic Block Store)
        -   persistent
        -   Network attached virtual device
    -   Instance-store
        -   basically the virtual hard drive on the host allocated to this EC2 instance
        -   limited to 10 GB per device

-   EC2 instance root/boot volumes can be EBS or Instance Store volumes
    -   **EBS-Backed EC2 instance** - it has an EBS root volume
    -   **Instance-Store backed EC2 instance** - it has an Instance-store root volume (ephemeral)

## Families

-   **feneral purpose**
    -   balanced memory and CPU
    -   suitable for most applications
    -   ex. M3, M4, T2
-   **compute optimized**
    -   more CPU than memory
    -   compute and HPC intensive tasks
    -   ex. C2, C4
-   **memory optimized**
    -   more RAM/memory
    -   memory intensive apps, DB, and caching
    -   ex R3, R4
-   **GPU compute instances**
    -   graphics optimized
    -   high performance and arallel computing
    -   ex. G2
-   **storage optimized**
    -   very high, low latency, I/o
    -   I/O intensive apps, data warehousing, Hadoop
    -   ex. I2, D2

## EBS

-   **general purpose**

    -   SSD-backed (solid state drives)
    -   are better for transactional workloads such as small databases & boot volumes, dev/test environments, low latency interactive apps where performance is highly dependent on IOPS
    -   volume sizes 1 GiB - 16 TiB
    -   max IOPS - 10000

-   **provisioned IOPS**

    -   SSD-backed
    -   use for mission critical applications and I/O intensive SQL/NoSQL databases
    -   provides sustainable IOPS performance and low latency
    -   max IOPS/Volume 32000
    -   volume sizes - 4 TiB - 16T TiB

-   **throughput optimized HDD (not SSD)**

    -   ideal for streaming, big data, log processing, and data warehousing
    -   can **NOT** be used as a boot volume
    -   use for frequently accessed, throughput intensive workloads
    -   size 500 GiB - 16 TiB

-   **Cold HDD**

    -   ideal for less frequently accessed workloads
    -   can **NOT** be the boot volume
    -   size 500 GiB - 16 TiB

-   **Magnetic EBS (HDD)**

    -   for transactional workloads, where performance is not dependent on IOPS, rather on MB/Sec transfer rate
    -   HDD backed
    -   use for infrequently accessed data
    -   volume size 1 GiB - 1 TiB

-   block device mapping, is the mapping of block storage devices in an AMI

    -   this includes both EBS and Instance Store volumes
    -   used to define which block storage volumes (root and data) to include/create when an instance is launched from the AMI
    -   you can view it an it shows both EBS and Instance-store volumes

    -   on the other hand, EC2 instance's block device mapping from the AWS Console shows only EBS volumes of the instance

        -   to show the instance-store volumes of the instance block device mapping, you need to query the instance metadata
        -   **curl http://169.254.169.254/latest/metadata/block-device-mapping/**

    -   you can make changes to the block device mappings while launching the instance or when it is launched

### Limits of the changes to block device mappings:

-   for the AMI block device mappints, for root volume, you can only modify volume size (up only), volume type, and the _delete on termination flag_
-   you can'y decrease an EBS volume size when you modify its size
-   you must specify a volume whose size is equal to or greater than the size of the snapshot specified in the block device mapping of the AMI (hence increase or keep the same volume size, but not decrease it)

### EBS Optimized Instances

-   EBS optimized EC2 instances enable the full use of an EBS volume's provisioned IOPS
    -   they deliver dedicated performance between EC2 instances and their attached EBS volumes
    -   are designed to work with all EBS volume types
        -   this is all about high performance data transfer between EC2 instances and their attached EBS volumes

**Single Root I/O virtualization (SR-I/OV)**

-   is a network interface (host instance) virualization whereby, a guest machine (EC2 instance) has direct access to a virtual network interface without hypervisor being in the middle (emulating a vNIC)

    -   basically, virtualizing the network adapter on the physical host

-   SR-I/OV
    -   not supported on all instance types
    -   for supported instance types, SR-I/OV provides
        -   higher packet per second (PPS) performance for data transfer
        -   lower latency
        -   very low network jitter

## Enhanced Networking

-   takes advantage of SR-I/OV on supported EC2 instance types to provide

    -   higher inter-instance PPS rates and low latency

-   EC2 enhanced networking can be enabled on EBS-backed or Instance-store-backed instances
-   EC2 enhanced networking can function across Multi-AZ

-   to use enhanced networking, the EC2 instance needs to
    -   support SR-I/OV
    -   should be created from HVM (hardware virtual machine) AMI
    -   be launched in a VPC (default behavior)
-   **enhanced networking does not cost extra**

## Placement Groups

-   is a logical grouping (clustering) of EC2 instances in the same AZ **OR** in different AZs with the goal of providing low latency, and high network performance throughput for inter-instance communication
-   a placement group, determines how instances are placed on underlying hardware
-   you can create a placement group by specifying one of two strategies:
    -   _cluster_ - clusters instances into a low-latency group in a single AZ
    -   _spread_ - spreads instances across underlying hardware in multiple AZs
-   there is no extra charge for creating a placement group

-   use SR-I/OV (Single root I/O virutalization) based enhanced networking instances for placement groups
-   to guarantee availability, try to launch all required instances at the same time
-   you can create placement groups across a VPC peering

### Cluster placement group

-   a cluster placement group is within a single availability zone
-   it is recommended when your applications require, and will benefit from, low network latency, high performance throughput, or both, and if the majority of the network traffic is between the instances in the group
-   to provide the lowest latency and the highest packet-per-second network performance for your placement group, choose an instance type that supports enhanced networking (SR-I/OV)

-   it is always recommended to launch the placement group instances at the same time
    -   if you try to add instances to the placement group, and you can't due to availability reasons, try to stop and start all instances
        -   this may result in migration to other hosts that have availability of the specific instance types requested for the group
-   try to avoid launching more than one instance type in the placement group (although possible), you increase your chances of getting an insufficent capacity error
-   if you stop an instance in a placement group and then start it again, it still runs in the placement group, however, the strat fails if there isn't enogh capacity for the instance

### Spread placement groups

-   a spread placement group is a group of instances that are each placed on distinct underlying hardware
-   spread placement groups are recommended for applications that have a small number of critical instances that should be kept separate from each other
    -   launching instances in a spread placement group reduces the rist of simultaneous failures that might occur when instances share the same underlying hardware
    -   spread placement groups provide access to distinct hardware, and are therefore mixing instance types or launching instances over time
-   a spread placement group can span multiple AZs
    -   you can have a maximum of seven running instances per AZ per group
-   if you start or launch an instance in a spread placement group and there is insufficient unique hardware to fulfill the request, the request fails
    -   you can try your request again later

### limitations

-   cluster placement groups can **NOT** span multiple AZs
-   a placement group name must be unique within an AWS account for the region
-   you can use different instance types within a placement group, however, this is not recommended for cluster placement groups
-   you can **NOT** merge two placement groups
-   you **CAN**:

    -   move an existing instance to a placement group
    -   move an instances from one placement group to another
    -   remove an instance from a placement group
    -   **before you begin, the instance must be in the stopped state**

-   an instance can **NOT** be launched in multiple placement groups at the same time
-   instances inside a placement group can address each other using private or public IP addresses
    -   best performance is achieved when they use private IP addresses for intra-placement group communication

## Status Checks

-   by default, AWS EC2 service performs automated status checks every one minute
    -   this is done on every running EC2 instance to identify any hardware or software issues
    -   each status check returns either a pass or a fail status
    -   if one or more status checks return a _fail_, the overall EC2 instance status is changed to _impaired_
-   status checks are build into the AWS EC2 service
    -   they can **NOT** be configured, deleted, distabled, or changed
-   you can configure CloudWatch to initiate action (reboot or recovery) on impaired EC2 instance (ie for failed status checks)

-   once EC2 instance(s) status changes to impaired because of a host hardware or software problem, AWS will schedule a stop/start for the EBS backed instances to relocate them to a different host
-   you can also do this manually
-   AWS EC2 service status checks are very important for auto-scaling groups too, to determine EC2 instances status

### Monitoring

-   EC2 service can send its metric data to AWS CloudWatch every 5 minutes (enabled by default)
    -   this is free of charge
    -   it is called _basic monitoring_
-   you can choose to enable detailed monitoring while launching the instance (or later) where the EC2 service will send its metric data to AWS CloudWatch every 1 minute

    -   chargeable
    -   it is called _detailed monitoring_

-   you can set CloudWatch alarm actions on EC2 instances(s) to
    -   stop, restart, terminate, or recover your EC2 instance
        -   you can use stop or terminate actions to save cost
        -   you can use the reboot and recover to move your EC2 instance to another host

## Instance states

-   when you launch an instance, it goes through _pending_ then _running_ states
-   moving to running state means, the instance has started booting
-   then the instance receives a private DNS hostname, and possible a public DNS hostname (depends on whether it is configured to receive a public IP)
-   **if you reboot an EC2 instance, it is considered as running** and does not add additional hour to your bill (applies only for instances that are charged by the hour, linux instances are charged by the second)
-   stopping and restartin an instance adds an hour to your bill (again, only for those instances that are charged by the hour)

-   when you stop an instance, AWS shuts it down
-   a stopped instance maintains its instance ID, and root volume
-   instance-store backed instances can **NOT** be stopped, they can only be rebooted and terminated
-   you are not charged for EC2 instances if they are stopped, however, attached EBS volumes incur charges
-   for stopped EC2 instances, you can detach/re-attach their EBS volumes including the root volume

    -   when detached, you can attach it to another instance, modify it, then re-attach it again to the stopped instance

-   when you stop an **EBS-backed instance**, any data in any instance-store volumes is lost
    -   despite the fact that the instance can be re-started, all instance store data will be gone
-   when you stop an EBS-backed instance

    -   instance performs a shutdown
    -   state changes from running -> stopping ->stopped
    -   EBS volumes remain attached to the instance
    -   any data cached in RAM or instance store volumes is gone
    -   most probably, when restarted again, it will restart on a new physical host
    -   **instance retains its private IPv4 address, any IPv6 address**
    -   **instance releases its public IPv4 address back to AWS pool**
    -   **instance retains its Elastic IP address**
        -   you will start to be charged for un-used elastic IP

-   if your instance was registered with an ELB, it is recommended that you de-register it from the ELB, such taht the ELB will stop health checks to the instance

    -   you can re-register it later when you restart it

-   if your instance was part of an auto-scaling group, the ASG would mark it when stoppped as unhealthy, terminate it, and replace it

    -   if you do not want this to happen, you better remove/detach the instance from the auto-scaling group before stopping it

-   rebooting an EC2 instance does not cause a new hour billing
-   best practice:
    -   use EC2 reboot and not the instance's operating system reboot
        -   two reasons:
            -   AWS when it initiates a reboot, waits for 4 minutes, then if the instance did not reboot, it will force a hard reboot
            -   AWS reboot creates an AWS Cloudtrail log, which is useful for forensics, troubleshooting and documentation/audit prurposes

### termination

-   when you terminate a running instance the instance state changes as follows:

    -   running -> shutting donw -> terminated
        -   during the shutting down and terminated states you do not incur charges

-   by default, EBS root device volumes (created automatically when the instance is launched) are deleted automatically when the EC2 instance is terminated

-   any additional (non boot/root) volumes attached to the instance (those you attach to the instance during launch or later), by default, persist after the instance is terminated

-   you can modify both behaviors by modifying the _DeleteOnTermination_ attribute of any EBS volume during instance launch or while running
-   you can view EBS root volume DeleteOnTermination behavior from _Block Device Mapping_

### termination protection

-   this is a feature you can enable such that an EC2 instance is protected against accidental termination through API, console, or CLI
-   this can enabled for instance-store backed and EBS-backed instances
-   CloudWatch can **ONLY** terminate EC2 instances if they **do not** have the termination protection enabled
-   if you want to terminate an instance that has termination protection turned on, you can do so by choosing OS shutdown, and configure AWS to treat OS shutdown as instance termination
-   this can be configured during launch, when the instance is running ir stopped

### troubleshooting instance immediate termination

-   AWS recommends that after you launch an EC2 instance, you check its status to confirm that it moved from pending to running, and not to a terminated state

-   possible reasons that a launched instance immediately terminates are:

    -   the instance store-backed AMI you used to launch the instance is missing a required part
    -   you've reached your EBS volume limit
    -   an EBS snapshot is corrupt

-   to find the reason of the termination:
    -   from AWS console: go to instances -> desciption tab -> state transition reason
    -   from CLI use the _describe-instance_ command

## Instance metadata

-   instance meta data:

    -   this is instance data that you can use to configure or manage the instance
        -   examples are IPv4 address, IPv6 address, DNS hostname, AMI-ID, instance-ID, Instance type, local-hostname ...
    -   meta data can be only viewed from within the instance itself
        -   you have to logon to the instance
    -   **metadata is not protected by encryption**, anyone that has access to the instance can view this data

-   to view an EC2 instance's meta data (from the EC2 instance console)

    -   _GET http://169.254.169.254/latest/meta-data/_
    -   or
    -   _curl http://169.254.169.254/latest/meta-data/_

-   to view a specific medatada parameter, example to view local hostname
    -   _curl http://169.254.169.254/latest/meta-data/host-name/_

### Instance user data

-   is data supplied by the **user at instance launch** in the form of a script to be executed during the instance boot
-   **user data is limited to 16 KB**
-   user data can only be viewed from within the instance itself
-   **you can change user data**

    -   to do so, you need to stop the instance first (EBS backed)
        -   instance -> actions -> instance-settings -> view/change user data

-   **user data is not protected by encryption**, do not include passwords or sensitive data in your user data
-   you are not charged for requests to read user data or metadata

## VM import export

-   can be used to migrate VMware, Microsoft, XEN VMs to the cloud (import)

-   the VM export is strictly for the EC2 instances that were originally imported through VM import and now want to export them again and use them on-premise. It does not apply for native EC2 instances on AWS that are created from AWS based AMIs

-   this supports:
    -   windows and linux VMs
    -   Vmware ESX VMDK (and OVA images for export only)
    -   Citrix XEN VHD
    -   MicroSfoft Hyper-V VHD
-   VM Import/Export is supported through API or CLI, but **NOT** through AWS console
-   before generating the VMDK or VHD images, make sure that VM is stopped and not in suspended or paused state

-   for vmware, AWS has a VM connector which is a plugin to vmware vCenter
    -   this allow the migration of VMs to AWS S3
    -   convert it to EC2 AMI
    -   and progress can be tracked in vCenter

## IAM roles

For an EC2 instance to have access to other AWS services (example S3) you need to configure an IAM role, which will have an IAM policy attached, under the EC2 instance.

-   applications on the EC2 instance will get this role permission from the EC2 isntance's medatada

## Bastion Host

For inbound, secure, connectivity to your VPC to manage and administer public and/or private EC2 instances, you can use a bastion host

-   the bastion host is an EC2 instance, whose interfaces will have a security group allowing inbound SSH (for Linux EC2 instances) or RDP for windows instances
-   bastion hosts can have auto-assigned public IP addresses or Elastic IP addresses (Elastic IPs are better for security reasons and to fix the IP address)
-   using security groups you can further limit which IP CIDRs can access the bastion host
-   once logged to the bastion host, you can connect via RDP or SSH to the EC2 instance(s) you desire to manage

-   to configure a bastion host in high availability, you can use auto scaling groups as follows:
    -   create the ASG with desired capacity of 2, choose multiple AZs (2) using Elastic IPs on each
        -   this is the recommended _high availability_ way
    -   (_not an high availability but saves on costs_) create an ASG with desired capacity 1, min 1, max 1, such that if the bastion instance fails, or gets terminated, the ASG will launch another one
        -   downside is, you have only one at a time, and you may have a down time until ASG launches another one
            -   but since this is for management/administration, a donwtime can be acceptable

**best practices** for automated, highly available bastion host deployment

-   the architecture supports AWS best practices for high availability and security

    -   linux bastion hosts are deployed in two AZs to support immediate access across the VPC
        -   you can configure the number of bastion host instances at launch

-   an auto-scaling group ensures that the number of bastion host instances alwaus matches the desired capacity you specify during launch
-   elastic IP addresses are associated with the bastion instances to make it easier to remember, and allow these IP addresses from on-premise firewalls
    -   if an instance is terminated and the auto-scaling group launches a new instance as a replacement, the existing elastic IP addresses are re-associated with the new instances

## Purchasing Options

-   **reserved instances**

    -   you do not actually buy instances, rather, you reserve long term capacity and pay for it for instance family/configuration, anytime you run (in that AZ or region) an on-demand instance that matches the reserved one, reserve pricing will apply to the on-demand instance
    -   you can purchase it at a significant discount
    -   purchased reserved instances are always available
    -   when purchased with an AZ scope, capacity reservation in the AZ is guaranteed
    -   term options are 1 year and 3 years
    -   once purchased, it can **NOT** be refunded or cancelled
        -   you can however, sell them on AWS reserved instance marketplace
            -   only the ones with AZ scope can be sold on the marketplace
    -   you are billed for reserved instance, whether it is running or stopped
    -   reserved instances do not renew automatically when the reserved term exipres, rather, billing reverts to on-demand billing rates
    -   you have no control over which EC2 on-demand instance will have the reserved instance prices applied to
    -   reserved instance benefits can only apply to on-demand instances (**not spot or dedicated**)
    -   by default, a reserved instance scope is region, however, it can be AZ or region

        -   if AZ, you get guaranteed reserved capacity in the AZ
            -   you can also sell the reservations with AZ scope on AWS reserved instance marketplace
        -   if the scope is region, you do not get reserved capacity guarantees
        -   you can change from scope AZ to scope region

    -   **what you can change**
        -   change AZ within the same region (keep it scope as AZ but for a different AZ)
            -   this also means you can migrate reserved instances between AZs in the same region
        -   change the scope from AZ to a region or the other way around
        -   change instance size within the same instance family (but no refunds are possible)
        -   you can modify all or a subset of your reservation
        -   you need to submit a request for the desired modification, through AWS console, CLI, or API
    -   _example_
        -   You have 14 RIs with scope of AZ1, and you submitted a request to AWS to do some modifications, where you want 6 RIs to be moved to AZ2, and 8 to remain in AZ1
            -   What will AWS do?
            -   AWS will split the request into two new reservations as follows:
                -   one for 8 RIs in AZ1
                -   another for 6 RIs in AZ2

-   **spot instances**
    -   almost all instance families are available for spot instances
    -   encrypted EBS volumes are supported in spot instances
        -   if you specify in your launch configuration, it will be honored
    -   use it if you are flexible regarding the time you want to run your applications
    -   use if your applications can be interrpted (in case AWS terminates the instance)
    -   suitable for:
        -   data analysis
        -   batch jobs
        -   background processing
        -   optional tasks
    -   use spot instances to augment your reserved and on-demand compute capacity, sice _spot instances' availability is not guaranteed_
    -   always guarantee the minimum level of compute using RIs and On-demand and add spot to add compute capacity and save costs

# ENI

-   _Eth0_ is the primary network interface
    -   you can't move/detach the primary (eth0) interface from an instance
-   by defaul, eth0 is the only ENI created with an EC2 instance when launched
-   you can add more interfaces to your EC2 instance (number of additional interfaces is determined by the instance family/type)
-   an ENI is bound to an AZ
-   you can specify which subnet/AZ you want the additional ENI be added in

-   you can specify exactly which IP addresses in the subnet to be configured on your instances, or leave AWS assign one automatically from the available subnet IPs
-   **security groups apply to network interfaces**, not to individual IPs on the interface, hence, IP addresses are also subject to the interface security group

-   you can create (optional) **only one** additional Ethernet interface (eth1) when launching an EC2 instance, but you can create and attach more ENIs to the EC2 intance (the number of which depends on the instance family/type)
-   attaching ENI when the instance is running is called **hot attach**
-   attaching ENI when the instance is stopped is called **warm attach**
-   attaching ENI when the instance is launched is called **cold attach**

-   when launching and EC2 instance, after selecting your VPC and subnet, you will be able to _add a device_, this is how you can add one more (eth1) interface
-   **CAUTION**

    -   if you do this, AWS will no longer assign public IPv4 address to your eth0 (primary network interface), and you will have to use an Elastic IP address mapped to your eth0 (manually) in order to be able to connect from the internet to your instance

-   by default, network interfaces created _automatically_ during EC2 instance launch by AWS console, are terminated when the instance is terminated
    -   does not include eth1 that you can add during launch (manually added)
-   network interfaces created by CLI are **NOT terminated** automatically when the EC2 instance terminates
-   **in both cases above, you can change the default** behavior by changing the _termination behavior_ from:

    -   instances -> net interfaces -> change termination behavior

-   each elastic network interface can have up to:

    -   a description
    -   one primary IPv4 address (private)
    -   **one or more secondary IPv4 addresses** (private)
    -   one Elastic IP address corresponding to each IPv4 address (via NAT)
    -   one public IPv4 address (automatically assigned)
    -   one or more IPv6 addresses
    -   **up to 5 security groups**
    -   a MAC address
    -   **a source/destination check flag**

-   you can configure secondary IPv4 addresses to your EC2 instance's interface and ENIs
-   it can be useful to assign multiple IP addresses to an EC2 instance in your VPC to do the following:

    -   hosting multiple websites on a single server (multiple SSl certificates each associated with one IP address)
    -   security and network appliances use in your VPC
    -   redirecting internal traffic to a standby EC2 instance in case your primary EC2 instance fails
        -   this can be achieved by moving (reassigning) the secondary IPv4 address from the failed instance to the standby one

-   **reassigning**

    -   when you configure secondary IPv4 addresses, and if you allow re-assignment, they can be reassigned to another network interface (moved, transitioned)
    -   you can reassign eth0's secondary private IPv4 address to another network interface
        -   comes handy in failure scenarios if your traffic was directed to the secondary IPv4 address, and the instance fails, move it (reassign it) to a standby instance if you have one, and the traffic will continue (the elastic IP to secondary IPv4 association remains as the secondary is moved)
    -   each private IPv4 address can be associated with a single Elastic IP address, and vice-versa
    -   when a secondary private IPv4 address is reassigned to another interface, the secondary private IPv4 address retains its association with an elastic IP address
    -   when a secondary private IPv4 address is unassigned from an interface, an associated elastic IP address is automatically disassociated from the secondary private IPv4 address

-   any network interface can be assigned a secondary IPv4 address from the same subnet of the network interface or EC2 instance
-   you can assign/remove IP addresses from EC2 instances while they are running or stopped
-   **detaching an ENI**

    -   **except for Eth0**, any interface **can be detached** and attached to other instances
    -   primary private IPv4, secondary private IPv4, IPv6, and Elastic IP addresses they continue to be with the same network interface even when it is **detached, or attached to another instance**

-   **example**

    -   _you have two instances, EC2-A, is the primary instance with a secondary IPv4 address, and an elastic IP address associated with the instance's secondary IPv4 address_
    -   _the second instance, EC2-B, will be a standby instance with no elastic IP address, and no secondary IPv4 address_
    -   _you can use the secondary IPv4 re-assignment feature to move the secondary IPv4 address and the associated elastic IP, to instance EC2-B, in case of a problem or failure of EC2-A_

-   to attach a network interface in a subnet to EC2 instance in another subnet, **they both MUST be in the same AWS region and the same AZ**
-   network NIC teeming is not achievable by adding ENIs to an EC2 instance

-   **example**
    -   _you can have one webserver with two network interfaces, one of which is sitting in a public subnet and is used to receive traffic from the internet (let's say port 80), and the second one sits in a private subnet which is connected to your HQ via VGW; this one is accessible only via its private address (no elastic address attached to it) and serves for management purposes_

## source destination check

-   we need to turn this check off (it is enabled by default) for NAT instance to function properly
-   it ensures that EC2 instance will accept traffic only if it is a destination for that traffic
-   NAT instance needs to accept traffic with a different destination and resend it

## Troubleshooting

-   **types**
    -   _error_ - Network error: **connection timed out** (or similar wording including time out)
        -   _reasons_ - your connection request might not be reaching the instance, or response might not be making it back to you (basically, connectivity is borken either by networking, security, or CPU load)
        -   _check_
            -   instance security group
            -   subnet route table
            -   subnet NACL
            -   instance has public or elastic IP
            -   corporate network FW rules
            -   **high CPU load on your instance**
    -   _error_ - **host key not found in [directory]**, permission denied (public key), or **authentication failed, permission denied**
        -   _reasons_ - your authentication had failed, due to either
            -   wrong username for the AMI
            -   wrong private (.pem) file
        -   _check_
            -   verify you are using the **correct user name** for the AMI
            -   verify that you are using the **correct private key file** which you created or used when you created the instance
    -   _error_ - **unprotected private key file**
        -   _reasons_ - your private key file must be protected from read and write operations from any other users
        -   _check/fix_
            -   use the _chmod_ linux command to change the permissions on the file
