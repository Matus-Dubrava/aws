-   [EC2](#ec2)
-   [Instance Types](#instance-types)
-   [EBS](#ebs)

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
    -   users can make up-front payment sto reduce their total computing costst even further
        -   Standard RIs (Up to 75% off on-demand)
        -   Convertible RIs (Up to 54% off on-demand) features the capability to change the attributes of the RI as long as the exchange results in creation of Reserved instances of equal or greater value
        -   Scheduled RIs are available to launh witchin the itme window you reserve. This option allows you to match your capacity reservation to a predictable recurring schedule that only requires a fraction of a day, a week, or a month
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
