-   [General overview](#general-overview)
    -   [Block storage vs object storage](#block-storage-vs-object-storage)
    -   [Data consistency models](#data-consistency-models)
-   [S3](#s3)
    -   [data consistency levels](#data-consistency-levels)
    -   [Buckets](#buckets)
        -   [subresources](#subresources)
    -   [Objects](#objects)
    -   [resources and subresources](#resources-and-subresources)
        -   [resource owner](#resource-owner)
    -   [Access policies](#access-policies)

# General overview

## Block storage vs object storage

-   block storage is suitable for transactional databases, random read/write loads, and structured database storage
-   block storage divides the data to be stored in evenly sized blocks (data chunks), for instance, a file can be split into evenly sized blocks before stored
-   data blocks stored in block storage would not contain metadata (date created, date modified ...etc)
-   block storage only keeps the address (index) where the data blocks are stored, it does not care what is in that block, just how to retrieve it when required

-   object storage stores the files as a whole and does not divide them
-   in object storage, an object is
    -   the file/data itself
    -   its metadata (data created, modified, security attributes, content type ...etc)
    -   object's global unique ID
-   the object global unique ID, is a unique identifier for the object (can be the object name itself) and it must be unique such that it can be retrieved disregarding where its physical storage location is
-   examples for objects
    -   photos, videos, music, static web content, data backups (snapshots), archival images
    -   any data that can be incrementally updated and will not have a lot of writes/updates
-   since object storage stores the object (file), its metadata, its global unique ID all together
    -   it is ideally suited for Distributed storage architecture
    -   this means it can scale easily **using cheaper hardware (comared to block storage)** by just adding additional storage units
-   in object storage there is no limit on the type or amount of metadata in an object
-   examples of object storage solutions
    -   AWS S3, Dropbox, Facebook (images/videos), Spotify
-   object storage can guarantee high availability and durability
    -   data copies are stored on multiple, geographically distributed locations
-   object storage can **NOT** be mounted as a drive, or directory, directly to an EC2 instance
-   object storage is a perfect solution for data growth storage problems

## Data consistency models

-   data consistency is relevant when we are considering copies of the same data object stored over distributed systems

-   when the copies of data (stored on different systems) are read at the same time from different nodes, consistency level refers to how consistent will be the returned data (from the reads), is it going to be 100% the same of slightly different?

### Strong consistency

-   sometimes also referred to as immediate consistency
-   a read from different data stores for the same data returns the exact same information
-   any update made to a data object in any storage node, will be propagated and updated on all other storage nodes before the data is made available for read by clients
-   requires a block mechanism, to block reads until the data is propagated and updated on all nodes
-   is good for transactional database and real time systems with consistent writes
-   has limited scalability and reduced availability

### eventual consistency

-   a read from different data stores for the same data may return different results
-   there is no blocking mechanism, if data is updates to an object, an immediate read from different nodes will not return the same data
    -   with time, and as the changes/updates get propagated and updated on all other storage nodes, the reads will be _eventually_ consistent
-   eventual consistency can virtually provide unlimited
    -   scalability
    -   availability
    -   data durability

# S3

-   S3 is a storage for the Internet; it has a simple web services interface for simpe storing and retrieval of any amount of data, anytime, from anywhere on the Internet
-   S3 is object-based storage, **not a block storage**
-   S3 has a distributed data-store architecture, where objects are redundantly stored in multiple locations

## data consistency levels

-   read-after-write (immediate/strong consistency) of PUTs of new objects (new object loads to S3)
    -   a PUT is an HTTP request to store the enclosed data (with the request)
-   eventual consistency for overwrite PUTs and DELETEs (for changes/updates to existing objects in S3)
-   updates to an object are **atomic**, i.e when you run a PUT for an object the you read (GET) that object, you will either get the update object or the old one (before the update), you will never get partial or corrupted data

## Buckets

-   data is stored in buckets
    -   a bucket can be viewed as a container for objects
    -   a bucket is a flat container of objects
        -   it does not provide aby hierarchical structure of objects (actual folders)
        -   you can use object key (name) to mimic folders in a bucket when using the AWS console
-   you can store unlimited objects in your bucket, but an **object can NOT exceed 5 TB**
-   you can create folders in your bucket (available through console only - not a real folders)
-   you can **NOT** create nested buckets (a bucket inside of another bucket)

-   bucket ownership is not transferrable
-   it is recommended to access S3 through SDKs and APIs (console internally uses APIs too)
-   an S3 bucket is region specific
-   you can have up to 100 buckets (soft limit) per account
-   an S3 bucket has properties including

    -   access permissions
    -   versioning status
    -   storage class

-   S3 bucket names (keys) are **globally unique across all AWS regions**
    -   buckets names can NOT be changed after they are created
    -   if a bucket is deleted, its name becomes available again to you or other accounts to use
    -   bucket names must be at least 3 and no more than 63 characters long
-   bucket names are part of the URL used to access a bucket

-   for better pefrormance, lower latency, and to minimize costs, create the S3 bucket closer to your client DC (or source of data to be stored)

**naming rules**

-   adjacent names must be a secries of one or more lavels (mymain.bucket)
    -   adjacent labels are separated by a single period (.)
    -   bucket names can contain lowercase letters, numbers, and hyphens
    -   each label must start adn end with a lowercase letter or a number
-   bucket names must not be formatted as an IP address (e.g., 192.168.4.5)

### subresources

-   Amazon S3 supports various options for you to configure your bucket

    -   S3 supports sub-resources for you to store, and manage the bucket configuration information
        -   using the Amazon S3 API, you can create and manage these sub-resources
        -   you can also use the console or the AWS SDKs

-   **by default**, a bucket, its objects, and related sub-resources are all private

    -   i.e by default only the owner has access to the bucket and stored objects

-   sub-resources (configuration containers) for S3 buckets include
    -   **lifecycle**: to decide on objects' lifecycle management
    -   **website**: to hold configurations related to static website hosted in S3 bucket
    -   **versioning**: keep object versions as it changes (gets update)
    -   **Access Control Lists (ALCs)**
    -   **bucket policies**

### DNS name

-   the name is simply two parts

    -   bucket region's end point/bucket name

-   example, for s3 bucket named _cloudbucket1_ in Europe West Region (Ireland)
    -   _https://S3-eu-west-1.amazonaws.com/cloudbucket1_

## Objects

-   an object size stored in an S3 bucket can be **zero bytes (0 bytes) up to 5 TB**
-   each object is stored and retrieved by a unique key (ID or name)
-   an object is AWS S3 is uniquely identified and addressed through

    -   service endpoint
    -   bucket name
    -   object key (name)
    -   optionally, object version

-   objects stored in a S3 bucket in a region **will NEVER leave the region** unless you specifically move them to another region, or enable _Cross Region Replication_
-   S3 provides high data durability, object are redundantly stored on multiple devices across multiple facilities in an Amazon S3 region (where the bucket exists)

-   sub-resources are subordiantes to objects; that is, sub-resources do not exist on their own, they are always assocaited with some other entiry, such as an object or a bucket
-   the sub-resources associated with S3 objects are
    -   access controls lists
        -   to define grantees and permissions granted to the object
    -   torrent
        -   used by S3 in case Bit Torrent tries to download the object

## resources and subresources

-   bucket and objects are primary S3 resources
-   each has its own sub-resources
-   bucket sub-resources are
    -   lifecycle, website, versioning, ACL and policies, CORS, and logging (bucket access logs)
-   object sub-resources are
    -   ACLs and Restore (restoring an archive)
-   operations on S3 are either
    -   bucket level operations
    -   object level operations

### resource owner

-   by default, all S3 resources are private
    -   only a resource owner can access the resource
-   the resource owner refers to the AWS account that creates the resource, for example
    -   the AWS account that you use to create bucket and objects owns those resources
-   if you create and AWS IAM user in your AWS account, your AWS account is the parent owner

    -   if the IAM user uploads an object, the parent account, to which the user belongs, owns the object (even if the bucket which the object was uploaded to was created by another account)

-   a bucket owner can grant cross-account permissions to another AWS account (or users in another account) to upload objects, it this case
    -   the AWS account that uloads the objects owns them
    -   the bucket owner does not have permissions on the objects that other accounts own, with the following exceptions
        -   the bucket owner pays the bill
        -   the bucket owner can deny access to any objects regardless of who owns them
        -   the bucket owner can delete any objects in the bucket, regardless of who owns them
        -   the bucket owner can archive any objects or restore archived objects regardless of who owns them

## Access policies

-   managing access refers to granting others (AWS accounts and users) permissions to perform the resource operations by writing an access policy
-   you can grant S3 bucket/object permissions to

    -   individual users
    -   AWS accounts
    -   make the resource public, grant permissions to everyone (also referred as anonymous access)
    -   or, to all _authenticated users_ (users with AWS credentials)

-   access policy describes who has access to what

    -   you can associate an access policy with
        -   a resource (bucket or object)
        -   or a user

-   you can categorize the available S3 access policies as follows
    -   **resource-based policies**
    -   **user policies**

### resource based policies

-   bucket policies and access control lists (ACLs) are resource-based because you attach them to your S3 resource

    -   **ACL-based access policies (bucket and object ACLs)**
        -   each bucket and object can have an ACL associated with it
        -   an ACL is a list of grants identifying grantee and permissions granted
        -   you use ALCs to grant basic read/write permissions to other AWS accounts
    -   **bucket policy** - for your buckets, you can add a bucket policy to grant other AWS accounts or IAM users permissions for the bucket and the objects in it
        -   aby object permissions apply only to the objects that the bucket owner creates
        -   bucket policies supplement, and in many cases, replace ALC-based access policies

-   **user access policies**
    -   you can use AWS IAM to manage access yo your S3 resources
    -   using IAM, you can create IAM users, groups, and roles in your account and attach access policies to them granting them access to AWS resources including S3
    -   you **cannot** grant anonymous permissions in an IAM user policy, because policy is attached to a user
    -   user policies can grant permissions to a bucket and the objects in it
        -   it can be attached to an IAM user, group, or role

**s3 evaluates**

-   **user context**
    -   S3 checks whether the user attached policies allows the request, so basically whether the parent account allows the operation to the IAM user or not
    -   if the user is the root account, the validation is skipped
-   **bucket context**

    -   S3 validates whether the bucket owner (can be the same parent account or another AWS account) has allowed the requested operation to the user
    -   bucket policy, bucket ACL, and Object (if object operation) are ALL checked

-   **notes**
    -   if the parent AWS account owns the resource (bucket or object), it can grant resource permissions to its IAM user by using either the user policy or the resource policy
    -   if the bucket and object owner is the same
        -   access to the object can be granted in the bucket policy, which is evaluated at the bucket context
    -   it the owners are different
        -   the object owners must use an object ACL to grant permissions
    -   if the AWS account that owns the object is also the parent account to which the IAM user belongs, it can configure object permissions in a user policy, which is evaluated at the user context
