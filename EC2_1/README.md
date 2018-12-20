-   [EC2](#ec2)
    -   [Families](#families)
    -   [EBS](#ebs)

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
