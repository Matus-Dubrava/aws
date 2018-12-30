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
        -   [ACL permissions](#acl-permissions)
        -   [bucket policies](#bucket-policies)
        -   [users policies](#users-policies)
    -   [versioning](#versioning)
    -   [multipart upload](#multipart-upload)
    -   [copying objects](#copying-objects)
    -   [storage classes](#storage-classes)
    -   [Glacier](#Glacier)
        -   [data retrieval](#data-retrieval)
        -   [costs](#costs)
    -   [lifecycle policy](#lifecycle-policy)
    -   [server side encryption](#server-side-encryption)

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

### ACL permissions

-   amazon S3 access control lists (ACLs) enable you to manage access to bucket and objects
-   each bucket and object has an ACL attached to it as a subresource

    -   it defines which **AWS accounts (grantees)** or **pre-defined S3 groups** are granted access and the type of access
    -   you can **NOT** provide permissions to individual IAM users here
    -   grantee accounts (cross account access) can then delegate the access provided by other accounts to their individual users

-   when you create a bucket or an object, S3 creates a default ACL that grants the resource owner full control over the resource

**Amazon S3 predefined groups**

-   S3 has a set of predefined groups, the following predefined groups

    -   **Authenticated users group**
        -   this group represents all AWS accounts; **access permissions to this group allows any AWS account to access the resource**, however, all requests must be signed (authenticated)
        -   when you grant access to the **authenticated users group** any AWS authenticated user in the world can access your resource
    -   **all users group**
        -   **access permissions to this group allows anyone in the world access to the resource**
        -   the requests can be signed or unsigned
        -   unsigned requests omit the Authentication header in the request
        -   AWS highly recommends that you never grant the **all users group** WRITE, WRITE_ACP, or FULL_CONTROL permissions
    -   **log delivery group**

-   the following lists the set of permissions that Amazon S3 supports in an ACL
-   the set of ACL permissions is the same for an object ACL and a bucket ACL
    **permissions**
-   **READ**
    -   **for bucket** allows grantee to list the objects in the bucket
    -   **for object** allows grantee to read the object data and its metadata
-   **WRITE**
    -   **for bucket** allows grantee to create, overwrite, and delete any object in the bucket
    -   **for object** not applicable
-   **READ_ACP**
    -   **for bucket** allows grantee to read the bucket ACL
    -   **for object** allows grantee to read the object ACL
-   **WRITE_ACL**
    -   **for bucket** allows grantee to write the ACL for the applicable bucket
    -   **for object** allows grantee to write the ACL for the applicable object
-   **FULL CONTROL**

    -   **for bucket** allows grantee the READ, WRITE, READ_ACL, WRITE_ACL permissions on the bucket
    -   **for object** allows grantee the READ, READ_ACL, WRITE_ACL permissions on the object

-   **grantee can only be account, or S3 predefined group, it can NOT be IAM user**

-   an object ACL is the only way to manage access to objects not owned by the bucket owner

    -   this can happen when the bucket owner authorizes another account to upload objects to the bucket, but still the bucket owner will not own the objects
    -   however, the bucket owner can deny, through the bucket policy, access to the object, even if the object ACL allows it
    -   the bucket owner can delete any object regardless whether it owns it or not

-   when managing granual permissions at the object level is required

    -   bucket policies are limited to 20 KB in size and won't be practical to be used for this
    -   object ACLs are limited to 100 granted permissions per ACL

-   the only recommended use case for the bucket ACL is to grant write permissions to the S3 Log delivery group to write access log objects to your bucket
    -   if you want S3 to deliver access logs to your bucket, you will need to grant write permission on the bucket to the Log Delivery Group
-   you can use bucket and object ACLs to grant cross-account permissions to other accounts, but ALCs support only a finite set of permissions, these don't include all S3 permissions

**limitations**

-   you can use ACLs to grant basic read/write permissions to other AWS accounts
-   there are limits to managning permissions using ACLs
    -   for example, you can grant permissions only to other AWS accounts, you cannot grant permissions to users in your account
-   you cannot grant conditional permissions, nor can you explicitly deny permissions, ACLs are suitable for specific scenarions
    -   for example, if a bucket owner allows other AWS accounts to upload objects, permissions to these objects can only be managed using object ACL by the AWS account that owns the object

### bucket policies

-   if an AWS account that owns a bucket wants to grant permissions to users in its account, it can be either a bucket policy or a user policy
-   if the AWS account that owns the object also owns the bucket, then it can write a bucket policy to manage the object permissions
-   **if you want to manage cross-account permissions for all S3 permissions**
    -   for cross account permissions, when you use to provide another account full S3 permissions, you can only do that via bucket policies

### users policies

-   user policies support granting permissions for all Amazon S3 operations
-   the user policies are for managing permissions for users in your account
-   if the AWS account that owns the object wants to grant permissions to a user in its account, it can use a user policy
-   an IAM user must have permissions from the parent account to which it belongs, and from the AWS account that owns the resource the user wants to access; the permissions can be granted as follows
    -   **permission from the parent account** - the parent account can grant permissions to its user by attaching a **user policy**
    -   **permission from the resource owner** - the resource owner can grant permissions to either the IAM user **(using a bucket policy)** or the parent account **(using a bucket policy, bucket ACL, or object ACL)**

### permissions delegation

-   if an account owns a resource, it can grant those permissions to another AWS account
    -   that account can then delegate those permissions, or a subset of them, to users in the account; this is reffered to as permission delegation
    -   an account that receives permissions from another account cannot delegate permission cross-account to another AWS account

## versioning

-   bucket versioning is a S3 bucket sub-resource used to protect against accidental object/data deletion or overwrites
-   versioning can also be used for data retention and archive
-   once you enable versioning on a bucket, it can not be disabled, however, it can be suspended
-   when enabled, bucket versioning will protect existing and new objects, and maintains their versions as they are updated (edited, written to...)
    -   updating objects regers to PUT, POST, COPY, DELETE actions on object
-   be default, and HTTP GET retrieves the most recent version
-   only S3 bucket owner can permanently delete objects once versioning is enabled

### delete markers

-   when versioning is enabled, and you try to delete an object, a DELETE marker is placed on the object
    -   you can still view the object and the delete marker
-   if you reconsider deleting the object, you can delete the DELETE marker, and the object will be available again
-   you will be charged for all S3 storage costs for all object versions stored
    -   you can use versioning with S3 lifecycle policies to delete older versions, or, you can move them to a cheaper storage S3 (or glacier)

### bucket versioning states

-   types

    -   enabled
    -   suspended
    -   un-versioned

-   versioning applies to all objects in a bucket and not partially applied
-   objects existing before enabling versioning will have a version ID of **NULL**
-   if you have a bucket that is already versioned, then you suspend versioning, existing objects and their versioins remain as is

    -   however they will not be updated/versioned further with future updates

-   while the bucket versioning is suspended

    -   new objects (uploaded after suspension), they will have a version ID of **NULL**
        -   if the same object key (name) is used to store another object, it will override the existing one (complete object overwrite)
    -   objects with versions that existed before the versioning suspension
        -   a new object with the same object key (name) will replace the current/latest version, but will have an ID **NULL**, and becomes the new current version
        -   a new object with the same key (name) will overwrite the one with the **null** ID

-   an object deletion in a suspended versioning bucket will only delete the object(s) with ID **null**
-   the bucket owner can permanently delete any versions

### MFA delete

-   multi factor authentication (MFA) delete is a versioning capability that adds another level of security in case your account is compromised
-   this adds another layer of security for the following
    -   changing your bucket's versioning state
    -   permanently deleting an object version
-   MFA delete requires
    -   your security credentials
    -   the code displayed on an approved physical or SW-based authentication device
-   this provides maximum protection to your objects

## multipart upload]

-   is used to upload an object (objects) in parts

    -   parts are uploaded independently and in parallel, in any order

-   it is recommended for object sizes of 100 MB or larger
    -   however, you can use for object sizes starting from 5 MB up to 5 TB
    -   **you must use it for objects larger than 5 GB**
-   this is done through the S3 multipart upload API

## copying objects

-   the copy operation creates a copy of an object that is already stored in S3
-   you can create a copy of your object up to 5 GB in size in a single atomic operation
-   however, to copy an object greater than 5 GB, you must use the multipart upload API
-   you will incur charges if the copy is to a destination that is another AWS region

-   can be done using AWS SDKs or REST API
-   use the copy operation to

    -   generate additional copies of the object
    -   renaming objects (copy to a new name; can also be done via AWS console)
    -   changing the copy's storage class or encrypt it at rest (these can be also done via AWS console)
    -   move objects across AWS locations/regions
    -   change object metadata
        -   once you upload an object to S3, you can NOT change some of its metadata, this is where copy comes in handy
        -   in this case, keep the same object key (name) for source and destination objects

-   when you successfully upload an object (a file) to S3, S3 returns an HTTP 200 OK message for a successful PUT operation
-   if uploading an object and requesting SSE (server side encryption) using Customer Provided Keys, and if the PUT operation is successful
    -   S3 then returns the HTTP 200 OK, the encryption algorithm, and MD5 of the encryption key you specified when uploading the object

## storage classes

### S3 standard

-   provides for 99.99% availability
-   11 9's data durability (99.999999999%)
-   data encrypted in-transit and the rest in S3
-   designed to sustain the concurrent loss of data in two facilities

### S3 Infequent Access (S3-IA)

-   for long-lived, less frequently accessed data
-   designed to sustain the concurrent loss of data in two facilities
-   suitable for backups and older data (old pictures, files)
-   99.9% availability
-   11 9's data durability

-   quick access and high performance like S3
-   data encrypted in-transit and at rest in S3 buckets
-   data must be kept for at least 30 days in this class
-   suitable for objects greater than 128 KB (not less than that)

### S3 reduced redundancy storage (S3-RRS)

-   designed to sustain the data loss in one facility
-   99.99% availability
-   99.99% durability
-   use for non-critical, reproducible data
-   lower level or redundancy
-   use for images and save their thumbnails in S3 standard, transcoded media
-   if an S3 RRS object is lost, AWS will return HTTP 405 error when the object is requested for read
-   S3 can send a notification in case an object is lost (ie. via SNS)

## Glacier

-   is an archiving storage for infrequently accessed data
-   archived objects are not available for real time access, you need to submit a retrieval request, restore the data first before you can read it (can take few hours)
    -   requested archival data will be copied to RRS
    -   after data is retrieved, you have up to 24 hours to download it
-   11 9's data durability
-   no SLA

-   is designed to sustain data loss in two facilities
-   you need to keep your data for a minimum of 90 days (minimum charge)
-   glacier automatically encrypts data at rest using AES-256-bit symmetric keys and supports secure transfer of your data (in-transit) over secure socket layer (SSL)
-   glacier objects are visible and available only through AWS S3 not through AWS Glacier

-   glacier redundanlty stores your data to multiple facilities, on multiple devices within each facility synchronously
-   glacier awaits until the multiple facility upload is completed successfully before confirming a successful upload to the user
-   glacier does **NOT** archive object metadata, you need to maintain a client-side database to maintain this information about the objects

    -   basically which archives hold which objects

-   suitable for

    -   media asset archiving
    -   health care information archiving
    -   regulatory and compliance archiving
    -   a replacement for magnetic tapes

-   you can upload archives to glacier of a size
    -   as small as 1 Byte
    -   as large as 40 TB
-   glacier file archives of size 1 bytes - 4 GB can be done in one shot
-   glacier file archives from 100 MB up to 40 TB, can uploaded to Glacier using multi-part upload
-   uploading archives is synchronous
-   downloading archives is asynchronous
-   the contents of an archive, once uploaded, can not be updated

-   AWS Import/Export Snowball comes in handy when you need to upload large amount of data to Glacier

    -   usually takes 5-7 days

-   when transitioning objects to Glacier from other classes (via lifecycle rules)

    -   Glacier adds ~32 KB overheads (indexing and archiving metadata) to the object
    -   you pay for these overheads in addition to your actual data
    -   the 32KB of overhead associated with each archive accounts for system indexing/metadata overhead

-   it is recommended to group a large number of small ojects, into a smaller number of larger archives to reduce these overhead charges

    -   if you need to access individual archived files, make sure that you group them in a way that allows this (compression techniques that allows the access to individual files)
        -   this will enable you to avoid downloading the entire archive to access individual files

-   maintaining client-side archive metadata

    -   Glacier does not support any additional metadata for the archives, except the archive description (optional)
        -   you might maintain metadata about the archives on the client-side; the metadata can include archive name and some other meaningful information about the archive

-   after you upload an archive, you **CANNOT** update its content or its description
    -   the only way you can update the archive content or its description is by deleting the archive and uloading another archive
    -   note that each time you upload an archive, Glacier returns to you a unique archive ID

### data retrieval

you can retrieve data from Glacier in multiple ways

-   **expedited**
    -   1-5 minutes
    -   more expensive
    -   use for urgent requests only
-   **standard**
    -   3-5 hours
    -   less expensive than expedited
    -   you get 10GB data retrieval free/month
-   **bulk retrieval**

    -   5-12 hours
    -   cheapest
    -   use to retrieve large amounts up to Petabytes in a day

-   you can retrieve parts of an archive
-   it is common to group multiple objects and compress them using TAR or ZIP format before archiving them
-   archived data class does not change when retrieving data from Glacier, because what gets retrieved is a copy of the data, placed into RRS, not the actual archive in Glacier

-   archive retrieval is an asynchronous job, you need to submit/initiate a request for that
-   you can use AWS SNS to be notified when a retrieval job has completed

-   when you restore an archive (or object therein) from Glacier
    -   you can specify while initiating the restore how long (default is 24 hours) you need the restored copy to be available to you
        -   you can also change this after the copy is made available in RRS (you can make it longer or shorted) by re-issuing a restore, AWS will update the same copy's expiration
    -   a copy of the object is moved into RRS, and the original remains in Glacier
    -   while the restoration is in progress, the console shows _restoration in progress_
    -   you pay for both Glacier and RRS storage for the duration the archive copy is available in RRS, after which, you only pay for Glacier storage
    -   the archive storage class remains to be Glacier

### Glacier Bytes Ranges

-   S3 and Glacier support HTTP GET requests with Range in HTTP header to identify a specific byte range you may want to retrieve from your Glacier archived data, instead or retrieving the entire archive
    -   this can help you manage the download charges (RRS charges)
    -   you can also download the portion of your object(s) that are within (in case the Glacier archive has many objects)
        -   but this also implies, you must maintain a client database (outside of Glacier) which includes information about the archive, the files contained, and the byte ranges
    -   this can also help you break a large archive retrieval into multiple jobs
-   byte range can start as low as 1 byte, and ends at increments of 1MB (archived portion retrieval can end at the archive end, or multiples of 1 MB)

### costs

-   no charges for data transferred between EC2 instances and Glacier in the same region
-   if you delete your data from Glacier before 90 days from when it was archived, you will be charged a deletion fee
-   when you restore a Glacier archive you pay for
    -   the Glacier archive itself
    -   the request(s)
    -   the restored copy from Glacier to RRS for the duration you specified in your restore request
        -   after that period, you only pay for Glacier archive alone

## lifecycle policy

-   this is a bucket level sub-resource (configuration)

    -   it can be applied to certain objects in a bucket folder, objects with a specific tag, or objects with a specific prefix
    -   the purpose is to primarily perform desired actions on contents (or some) of the bucket
    -   you can configure two actions
        -   transition actions: to another S3 storage tier after a configured period
        -   expiration actions: where an expiration duration for object is set, S3 will then delete the expired objects on your behalf

-   objects less than 128KB will not be transitioned to S3-IA
-   objects must be stored in S3-IA for at least 30 days
-   an object must be in S3-Standard for at least 30 days before it can be transitioned to S3-IA

    -   the same applies to non-current versions of an object (when versioning is enabled) they must stay in S3 standard for 30 days before they can be moved to S3-IA

-   you can **NOT** use lifecycle policies to move an archived object from Glacier to S3 standard or S3-IA
-   the workaround to this is
    -   restore the archived object from Glacier to RRS
    -   copy the object
        -   while copying specify the new storage class of the copy
        -   storage class of the original remains in Glacier
-   you can **NOT** change an object from any storage class (including S3 standard and S3-IA) into RRS
-   you can't change from S3-IA to Standard or S3-RRS

## server side encryption

-   this is primarily about encrypting data at rest in S3 buckets
-   there are two main ways to encrypt data stored on S3 bucket
    -   client side encryption
        -   where the client encrypts data on the client side, then transfer the data encrypted to S3 bucket (hence data is encrypted in-transit and at rest)
    -   server side encryption (SSE)
        -   data is encrypted by the S3 service before it is saved to S3 storage disks
        -   data is decrypted when you download it
-   user access to S3 bucket objects is the same whether the data is encrypted or not on S3 buckets (as long as the user has permissions to access the data)

-   at any given time, you can apply onle one encryption type to an S3 object
-   depending on how you manage encryption keys, there are three types of S3 SSE available

    -   SSE-S3
        -   server side encryption on S3 using S3 managed encryption keys
    -   SSE-KMS
        -   server side encryption using AWS KMS keys
    -   SSE-C
        -   server side encryption using client provided keys

-   for SSE to be requested in an API call, the request has to include the **x-amz-server-side-encryption** header requesting server side encryption
-   if you want SSE-KMS then the **x-amz-server-side-encryption** header has to define SSE-KMS
    -   _"s3:x-amz-server-side-encryption:"aws:kms"_

### SSE-S3

-   server side encryption in S3 using S3 managed encryption keys
-   each object is encrypted by a unique key, then the encryption key itself is encrypted using master key
-   S3 regularly rotates the master key
-   uses AES-256 bits

-   KMS generates this **data key** end encrypts it using the **master key that you** specified earlier
-   KMS then returns this **encrypted data key** along with the **plaintext data key** to Amazon S3
-   S3 encrypts the object using the **plaintext data key first**, and then stores the now encrypted object (along with the encrypted object key) and deletes the plaintext object key from memory
-   to retrieve this encrypted object, S3 sends the encrypted data key to AWS KMS
-   AWS KMS decrypts the data key using the correct master key and returns the decrypted (plaintext) object key to S3
-   with the plaintext object key, S3 decrypts the encrypted object and returns it to you
-   each object is encrypted with a unique data key
    -   this key is encrypted with a periodically rotated key managed by AWS KMS
    -   S3 server side encryption uses 256-bit AES keys for both object and master key
-   this feature is offered at no additional cost beyond what you pay for using S3

### SSE-KMS

-   server side encryption using AWS KMS keys, similar to SSE-S3
    -   KMS uses Customer Master Keys (CMKs) to encrypt your S3 objects
    -   you can continue to use the automatically created default CMK key for encryption
    -   or, you can select a CMK that you created separately using AWS Key Management System
        -   creating your own CMK will allow you to create, rotate, disable, and define access controls
        -   also allows you to audit the encryption keys used to protect your data
-   separate permissions for an envelope key that protects/encrypts your object encryption keys
-   service is chargeable

### SSE-C

-   server side encryption using client provided keys
-   client manages the keys, S3 service manages encryption
-   AWS does not store the client provided encryption key(s), so if the client looses the key(s) they can't access the object, basically they loose the data
-   when the client retrieves this object from S3, they must provide the same encryption key in the request
    -   S3 verifies that the encryption key matches
    -   decrypts the object, and returns the object to the requester
