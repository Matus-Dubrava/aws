-   [S3](#s3)
-   [Data Consistency](#data-consistency)
-   [Key Value Storage](#key-value-storage)
-   [Properties](#properties)
-   [Storage Tiers](#storage-tiers)
-   [Charges](#charges)
-   [Versioning](#versioning)
-   [Cross Region Replication](#cross-region-replication)
-   [Lifecycle Management](#lifecycle-management)
-   [CDN](#cdn)
-   [Encryption](#encryption)
-   [Storage Gateway](#storage-gateway)
-   [Snowball](#snowball)
-   [Transfer Acceleration](#transfer-acceleration)
-   [Static Websites](#static-websites)
-   [Use Cases](#use-cases)
-   [Review](#review)

# S3

-   Simple Storage System.
-   Object based, used as a file storage (0 - 5TB).
-   files are stored in buckets which have name associated witch them, this name must be globally unique (there can't be two buckets with the same name); example **https://s3-eu-west-1.amazonaws.com/myuniquebucketname** where part - **s3-ue-west-1** is the name of availability zone
-   once we successfully upload file to S3, we get back http response with 200 status code

# Data Consistency

There are 2 types of data consistency in S3 - **immediate** and **eventual**.

Immediate consistency - read after write for PUTS operarion. This means that when we upload a new file to S3 and try to read that file rigth after, what we get back will be the newly uploaded file.

Eventual consistency for overwrites - PUTS and DELETES - when we modify an existing file, such operation can take a certain amount of time because S3 is spread across multiple availability zones (it will take some tome to propagate changes) so we get either the updated or old file content when we try to read it immediatelly after we have performed some update operation. Eventual consistency means that it will be consistent, eventually.

# Key Value Storage

S3 is Object based where the object has these properties.

-   **key** - this is simply the name of the object
-   **value** - this is simply the data and it is made up of sequence of bytes
-   **version ID** - important for versioning
-   **metadata** data about data that we are storing
-   **subresources**
    -   Access Control Lists
    -   Torrent

# Properties

-   built for 99.99% availability for the S3 platform
-   Amazon guarantees 99.9% availability
-   Amazin guarantees 99.999999999 durability for S3 information (11 x 9)
-   Tiered Storage Available
-   Lifecycle Management
-   Versioning
-   Encryption
-   Secure your data using Access Control Lists and Bucket policies

# Storage Tiers

-   **S3 standard**: 99.99% availability, 99.999999999% durability, stored redundantly across multiple devices in multiple facilities and is designed to sustain the loss of 2 facilities concurrently.

-   **S3 - IA** (Infrequently Accessed): For data that is accessed less frequently but still requires rapid access when needed. Lower fee than S3 but we are being charged a retrieval fee.
    Has the same availability and durability as the **S3 standard** tier.

-   **S3 One Zone - IA**: the same as above but for lower price and less data resilience because as the title suggests, the data is stored only in one availability zone

-   **Glacier** very cheap data storage, used for data archival only. There are 3 types of Glacier storage - **expedited**, **standard** and **bulk**. Expedited data retrieval takes some minutes, Standard takes 3 - 5 hours and Bulk takes 5- 12 hours.

# Charges

-   **storage**: how much data we store
-   **requests**: how much is the file requested
-   **storage management pricing**: charged for metadata
-   **data transfer pricing**: data transfer between zones (cross-region)
-   **transfer acceleration**: enables fast, easy, and secure transfer of files over long distances between our users and S3 buckets; Transfer acceleration takes advantages for Amazon's **CloudFront**'s globally distributed edge locations (CDN). As the data arrives at an edge location, data is routed to Amazon S3 over an optimized network path (Amazon backbone network)

# Versioning

-   stores all versions of an object (includes all writes and even if we delete an object - it is not deleted, only a new `delete` marker is created as the newest version of the object)
-   great backup tool
-   versioning is enabled per bucket and once enabled, it can't be disabled, only suspended
-   integrates with lifecycle rules
-   versioning's MFA (multi-factor authentication) Delete capability can be used to provide additional layer of security

# Cross Region Replication

-   versioning must be enabled on both the source and the destination buckets
-   regions must be unique
-   files in an existing bucket are not replicated automatically; all subsequent updated files will be replicated automatically
-   we cannot replicate to multiple buckets or use daisy chaining (this can change)
-   delete markers are not replicated
-   deleting individual versions or delete markers will not be replicated

# Lifecycle Management

-   can be used in conjunction with versioning
-   can be applied to both current and previous versions of objects
-   following actions can be done
    -   transition to the Standard - IA storage class (30 days **minimum** after creation date)
    -   archive to the glacier storage class (30 days **minimum** after IA, or right after if there is not transition to IA)
    -   transition to One-Zone IA after 30 days after creation or 30 days after moved to IA, can move only to glacier afterwards
    -   permanently delete
    -   transition to inteligent tiering immediatelly
    -   can't transition anywhere from glacier

# CDN

A content delivery network is a system of distributed servers (network) that deliver webpages and other web content to a user based on the geographic location of the user, the origin of the webpage and a content delivery server.

-   **edge location** this is the location where content will be cached; it is separate to an AWS regions/AZ

    -   edge locations are not just READ only, you can write to them too (ie put an object on to them)
    -   objects are cached for the life of the TTL (Time To Live)
    -   you can clear cached objects, but you will be charged

-   **origin** this is the origin of all the files that the CDN will distribute; this can be either an S3 bucket, an EC2 instance, an Elastic Load Balancer or Route 53, or even an non-AWS resource

-   **distribution** this is the name given the CDN which consists of a collection of Edge Locations

    -   **web distribution** typically used for websites
    -   **RTMP** used for media streaming

**Amazon CloudFront** can be used to deliver your entire website, including dynamic, static, streaming, and interactive content using a global network of edge locations. Requests for your content are automatically routed to the nearest edge location, so content is delivered with the best possible performance.

Amazon CloudFront is optiimized to work with other Amazon Web Services, like Amazon Elastic Compute Cloud (EC2), Amazon Elastic Load Balancig, and Amazon Route 53. Amazon CloudFront also works seamlessly with any non-AWS origin server, which stores the original, definitive versions of your files.

# Encryption

We can secure bucket by

-   **bucket policies**
-   **ACL (Access Control List)**

-   **in transit** - when we are sending information to and from our bucket

    -   SSL/TLS

-   **at rest**
    -   **server side encryption**
        -   S3 Managed Keys (SSE-S3) - uses AES-256 symetric keys to encrypt the data and these keys are furthermore encrypted by master key which is rotated; AWS handles keys for us
        -   AWS Key Management Service, Managed Keys (SSE-KMS)
        -   Server Side Encryption With Customer Provided Keys - SSE-C
    -   **Client Side Encryption**

# Storage Gateway

AWS storage gateway is a service that connects an on-premises software appliances with cloud-based storage to provide seamless and secure integration between an organization's on-premises IT environment and AWS's storage infrastructure. The service enables you to securely store data to the AWS cloud for scalable and cost-effective storage.

AWS Storage Gateway's software appliance is available for download as a virtual machine (VM) image that you install on a host in your datacenter. Storage GAteway supports either VMware ESXi or Microsoft Hyper-V. Once you've installed your gateway and associated it with yout AWS account through the activation process, you can use the AWS Management Console to create the storage gateway option that is right for you.

4 types of Storage Gateway

-   **File Gateway (NFS)** - for flat files, stored directly on S3
-   **Volume Gateway (iSCSI)** - block volumes (operating systems, database servers etc.)
    -   **Stored Volumes** - entire dataset is stored on site and is asynchronously backed up to S3
    -   **Cached Volumes** - entire dataset is stored on S3 and the most frequently accessed data is cached on site
-   **Tape Gateway (VTL)** - used for backups and uses popular backup applications like NetBackup, Backup Exec, Veeam etc.

## File Gateway

Files are stored as objects in your S3 buckets, accessed through a Network File System (NFS) mount point. Ownership, permissions, and timestamps are durably stored in S3 in the user-metadata of the object associated with the file. Once objects are transferred to S3, they can be managed as native S3 objects, and buckets policies such as versioning, lifecycle management, and cross-region replication apply directly to objects stored in your bucket.

## Volume Gateway

The volume interfaces presents your applications with disk volumes using the iSCSI block protocol.

Data written to these volumes can be asynchronously backed up as point-in-time snapshots of your volumes, and stored in the cloud as Amazon **EBS** snapshots.

Snapshots are incremental backups that capture only changed blocks. All snapshot storage is also compressed to minimize your storage charges.

### Volume Gateway - Stored Volumes

Stored volumes let you store your primary data locally, while asynchronously backing up that data to AWS. Stored volumes provide your on-premises applications with low-latency access to their entire datasets, while providing durable, off-site backups. You can create storage volumes and mount them as iSCSI devices from your on-premises application servers. Data writeen to your stored volumes is stored on your on-premises storage hardware. This data is asynchronously backed up to Amazon Simple Storage Service (S3) in the form of Amazon Elastic Block Store (Amazon EBS) snapshots. 1 GB - 16 TB in size for Stored Volumes.

### Volume Gateway - Cached Volumes

Cached volumes let you use Amazon Simple Storage Service (S3) as your primary data storage while retaining frequently accessed data locally in your on-premises storage gateway. Cached volumes minimize the need to scale your on-premises storage infrastructure, while still providing your applications with low-latency access to their frequently accessed data. You can create storage volumes up to 32 TB in size and attach to them as iSCSI devices from your on-premises application servers. Your gateway stores data that you write to these volumes in Amazon S3 and retains recentlu read data in your on-premises storage gateway's cache and upload buffer storage. 1 GB - 32 TB on size for Cached Volumes.

### Volume Gateway - Tape Gateway

Tape Gateway offers a durable, cost-effective solution to archive
your data in the AWS Cloud. The VTL (Virtual Tape Library) interface it provides lets you leverage your existing tape-based backup application infrastructure to store data on virtual tape cartridges that you create on your tape gateway. Each tape gateway is preconfigured witch a media changer and tape drives, which are available to your existing client backup applications as iSCSI devices. You add tape cartridges as you need to archive your data. Supported by NetBackup, Backup Exec, Veeam etc.

# Snowball

AWS Import/Export Disk accelerates moving large amounts of data into and out of the AWS cloud using portable storage devices for transport. AWS Import/Export Disk transfers your data directly onto and off storage devices using Amazon's high-speed internal network and bypassing the Internet.

types:

-   **Snowball**
-   **Snowball Edge**
-   **Snowmobile**

## Snowball

Is a petabyte-scale data transport solution that uses secure appliances to transfer large amounts of data into and out of AWS. Using Snowball addresses common challenges with large-scale data transfers including hogh network costs, long transfer times, and security concerns. Transferring data with Snowball is simple, fast, secure, and can be as little as one-fifth the cost of high-speed Internet.

80TB snowball in all regions. Snowball uses multiple layers of security designed to protect your data including tamper-resistant enclosures, 256-bit encryption, and an industry-standard Trusted Platform Module (TPM) designed to ensure both security and full chain-of-custody of your data. Once the data transfer job has been processed and verified, AWS performs a software erasure of the Snowball appliance.

## Showball Edge

AWS Snowball Edge is a 100TB data transfer device with on-board storage and computing capabilities. You can use Showball Edge to move large amounts of data into and out of AWS, as a temporary storage tier for large local datasets, or to support local workloads in remote or offline locations.

Snowball Edge connects to your existing applications and infrastructure using standard storage interfaces, streamlining the data transfer process and minimizing setup and integration. Snowball Edge can cluster together to form a local storage tier and process your data on-premises, helping ensure your applications continue to run even when they are not able to access the cloud.

## Snowmobile

AWS Snowmobile is an Exabyte-scale data transfer service used to move extremly large amounts of data to AWS. You can transfer up to 100PB per Snowmobile, a 45-foot long ruggedized shipping container, pulled by a semi-trailer truck. Snowmobile makes it easy to move massive volumes of data to the cloud, including video libraries, image repositories, or even a complete data center migration. Transferring data with Snowmobile is secure, fast, and cost effective.

# Transfer Acceleration

Allows us to leverage AWS's CDN (AWS CloudFront) for faster data uploads. Instead to uploading data directly to S3 bucket through the Internet, we can use a CDN end point to upload data to. The data is then transferred to our S3 bucket via AWS optimized backbone network which can be significantly faster.

Enable this option under S3 bucket properties -> Transfer Acceleration.

Additional fee is applied for using this service.

# Static Websites

-   you can use bucket polices to make entire S3 buckets public
-   you can use S3 to host **STATIC** websites (such as .html). Websites that require database connections such as Wordpress ets cannot be hosted on S3.
-   S3 scales automatically to meet your demand. Many enterprises will put static websites on S3 when they think there is going to be a large number of requests (such as for a movie preview for expample)

example of bucket policies:

```javascript
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "PublicReadGetObject",
			"Effect": "Allow",
			"Principal": "*",
			"Action": [
				"s3:GetObject"
			],
			"Resource": [
				"arn:aws:s3:::BUCKET_NAME/*" // BUCKET_NAME must be replaced with the name of actual bucket
			]
		}
	]
}
```

# Use Cases

We can use Amazon S3 as:

-   **Backup Storage** - Amazon S3 can provide storage for data backup services. Many third-party backup solutions provide connectors for S3 to enable backup applications to write directly to or copy backup files to S3. We can also copy backup files to S3 from anywhere the Amazon Console, API or CLI.
-   **Media Hosting** - we can use S3 as a rednundant, scalable, and highly available storage infrastructure that hosts videos, photos, or music uploads and downloads. i.e. we can host a photo sharing website and use S3 for storing all of the photos.
-   **Applications Assests** - we can use S3 as a storage for data that is required by out applications, we can configure application to directly read and write data from and to S3
-   **Data Lake** - enables an organization to stora all of their data, structured and unstructured in one centralized repository
-   **Content Delivery** - we can use S3 to host our content that customers can download

# Review

-   S3 is Object based i.e. allows us to upload files
-   not suitable to install an operating system on
-   Files can be from 0 Bytes to 5TB
-   There is unlimited storage
-   files are stored in buckets - a folder like structures
-   S3 is a universal namespace, that is, names must be unique globally
-   https://s3-eu-west-1.amazonaws.com/bucket_name
-   Read after Write consistency for PUTS of new Objects
-   Eventual consistency for overwrite PUTS and DELETES (can take some time to propagate)
-   Write to S3 - HTTP 200 code for a successful write
-   we can load files to S3 much faster by enabling multipart upload (splitting files to several pieces)
-   Tiers: S3 Standard/S3-IA/S3 One Zone - IA/Glacier
-   S3 structure

    -   Key (name)
    -   Value (data)
    -   Version ID
    -   Metadata
    -   Access Control Lists

-   S3 versioning

    -   stores all versions of an object (including all writes and even if we delete an object)
    -   great backup tool
    -   once enabled, versioning cannot be disabled, only suspended
    -   integrates with Lifecycle rules
    -   versioning's MFA Delete capability, which uses multi-factor authentication, can be used to provide an additional layer of security
    -   cross region replication, requires versioning enabled on the source bucket as well as destination bucket

-   S3 Lifecycle Management

    -   can be used in conjunction with versioning
    -   can be applie dto current versions and previous versions
    -   following actions can now be done
        -   transition to the standard - infrequent access storage class (128Kb and 30 days after the creation data)
        -   archive to the Glacier Storage Class (30 days after IA, if relevant)
        -   permanently delete

-   CloudFront

    -   Edge Location - This is the location where content will be cached. This is separate to an AWS Region/AZ
    -   Origin - This is the origin of all the files that the CDN will distribute. This can be either an S3 bucket, an EC2 Instance, an Elastic Load Balancer or Route 53
    -   Distribution - This is the name given the CDN which consists of a collection of Edge Locations
        -   Web Distribution - Typically used for Websites
        -   RTMP - Used for Media Streaming
    -   Edge locations are not just READ only, you can write to them too (ie put an object on to them)
    -   Object are cached for the life of the TTL (Time To Live)
    -   We can clear cached objects, but we will be charged for doing so

-   Securing our buckets

    -   by default, all newly created buckets are PRIVATE
    -   We can setup access control to our buckets using
        -   bucket policies
        -   Access Control Lists
    -   S3 buckets can be configured to create access logs which log all requests made to the S3 bucket. This can be done to another bucket.

-   Encryption

    -   In transit
        -   SSL/TLS
    -   At rest
        -   Server Side Encryption
            -   S3 Managed Keys - SSE-S3
            -   AWS Key Management Services, Managed Keys - SSE-KMS
            -   Server Side Encryption With Customer Provided Keys - SSE-C
        -   Client Side Encryption

-   Storage Gateway
    -   File Gateway - for flat files, stored directly on S3
    -   Volume Gateway
        -   Stored Volumes - Entire Dataset is stored on site and is asynchronously backed up to S3
        -   Cached Volumes - Entire dataset is stored on S3 and the most frequently accessed data is cached on site
    -   Gateway Virtual Tape Library (VTL) - used for backups and uses popular backup applications like NetBackup, Backup Exec, Veeam etc.
-   Snowball

    -   types
        -   (old) Import/Export
        -   Snowball
        -   Snowball Edge
        -   Snowmobile
    -   Snowball is used to import and export data to and from AWS S3

-   Transfer Acceleration - we can speed up transfers to S3 using S3 transfer acceleration. This costs extra, and has the greatest impact on people who are in far away locations (leverages CloudFront Edge Locations - this is where data is uploaded to in case of using it)

-   Static websites

    -   we can use S3 to host static websites
    -   serverless
    -   very cheap, scales automatically
    -   STATIC only, cannot host dynamic sites

-   Use cases
    -   backup tool
    -   media hosting
    -   content delivery
    -   data lake
    -   application assets
