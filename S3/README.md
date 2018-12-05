-   [S3](#s3)
-   [Data Consistency](#data-consistency)
-   [Key Value Storage](#key-value-storage)
-   [Properties](#properties)
-   [Storage Tiers](#storage-tiers)
-   [Charges](#charges)
-   [Versioning](#versioning)
-   [Cross Region Replication](#cross-region-replication)
-   [Lifecycle Management](#lifecycle-management)

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
