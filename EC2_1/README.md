-   [EC2](#ec2)
    -   [Families](#families)
    -   [EBS](#ebs)
        -   [EBS Optimized Instances](#ebs-optimized-instances)
    -   [Enhanced Networking](#enhanced-networking)
    -   [Placement Groups](#placement-groups)

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
