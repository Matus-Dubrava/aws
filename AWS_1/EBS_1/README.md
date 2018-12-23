-   [EBS](#ebs)
-   [snapshots](#snapshots)
-   [encryption](#encryption)

# EBS

-   two types of Block store devices are supported
    -   **elastic block store (EBS)**
        -   persistent
        -   network attached virtual drives
        -   the EBS backed EC2 instance (ie the boot volume of which is EBS) can be stopped, restarted, and terminated
        -   EBS volumes behave like raw, unformatted, external block storage devices that you can attach (mount) to your EC2 instances
        -   EBS volumes are block storage devices suitable for database style data that require frequent reads and writes
        -   EBS volumes are attached to your EC2 instances through the AWS network, like virtual hard drives
        -   an EBS volume can attach to a single EC2 instance only at a time
        -   both EBS volumes and EC2 instance **must be in the same AZ**
            -   you can **NOT** attach a volume in one AZ to an EC2 instance in a different AZ
        -   an EBS volume data is replicated by AWS across multiple sefvers in the same AZ to prevent data loss resulting from any single AWS component failure
        -   by default, EBS volumes created when an EC2 instance is launched are deleted when the instance is terminated, including the root volume
        -   EBS is persistent and can retain the data it has even when the EC2 instance is stopped or restarted
            -   if configured, it can persist after the EC2 instance is terminated
                -   you can change this by changing the _DeleteOnTermination_ attribute of the instance's block store (EBS) volumes
                    -   an EBS volume (root or not) with _DeleteOnTermination_ attribute set to _false_ will not be deleted when the instance is terminated
                    -   this comes in handy when you want to keep the EBS volume for future use while you terminate the EC2 instance
    -   **instance-store**
        -   basically the virtual hard drive on the host allocated to this EC2 instance
        -   limited to 10 GB per device
        -   ephemeral (data is lost on instance shutdown)
            -   the EC2 instance can't be stopped, can only be rebooted or terminated
                -   reboot will not erase the instance data
                -   termination will erase the data
        -   instance store-backed EC2 instances boot from an AMI stored in S3
        -   **use instance store instead of EBS** if very high IOPS rate is required
            -   instance store, although can not provide for data persistence, but it can provide much higher IOPS compared to, network attached, EBS storage
            -   remember that, instance store is the virtual hard disk space allocated to the instance on the local host
                -   it is alos work noting that not all newer EC2 instance support instance store volumes
    -   the difference between an **instance-store backed EC2 instance**, and **EBS-backed EC2 instance that has instance-store volumes** is:
        -   the first one meanst that EC2 instance can **NOT** be stopped, because the root volume is instance-store
        -   the second one **CAN** be stopped, because the main boot volume is EBS, but it has instance-stored volumes for data
            -   when stopped, all instance store volumes' data will be lost

# snapshots

-   EBS snapshots are point-in-time images/copies of your EBS volumes
-   any data written to the volume after the snapshot process is initiated, will **NOT** be included in the resulting snapshot (but will be included in future, incremental, updates)
-   per AWS account, up to 5000 EBS **volumes** can be created
-   per AWS account, up to 10000 EBS **snapshots** can be created
-   EBS snapshots are stored in S3, however you can **NOT** access them directly, you can only access them through EC2 APIs
-   this is unlike instance-store AMIs (where you specify an S3 bucket of your choice)
-   while EBS vlumes are AZ specific
    -   snapshots are **region specific**
    -   to migrate an EBS from one AZ to another, create a snapshot (region specific), and create an EBS volume from the snapshot in the intended (other) AZ
-   you can create/restore a snapshot to an EBS volume of the same or larger size than the original volume size, from which the snapshot was initially created

    -   but you can **NOT** restore an EBS volume's snapshot to a smaller volume size

-   you can take a snapshot of a non-root EBS volume while the volume is in use on a running EC2 instance
    -   this meanst, you can still access it while the snapshot is being processed
    -   however, the snapshot will only include data that is already written to your volume
        -   any data cached by the operating system (OS), or in memory, will not be included, which means the snapshot will not be 100% consistent
-   the snapshot is created immediately, but it may stay in **pending status** until the full snapshot is complete (all changed data blocks are copied to S3), the status then changes to **complete**
    -   this may take few hours to complete, especially for the first time snapshot of a volume
-   during the period when the snapshot **status is pending**, you can still access the volume, but the I/O might be slower because of the snapshot activity
-   while in pending state, an in-progress snapshot will **not** include data from ongoing reads and writes to the volume

    -   this is why for a complete snapshot you need to stop I/Os or unmount the volume if possible (or stop the instance for root volumes)

-   to take a **complete (consistent)** snapshot of your **non-root (not the boot) EBS volume**
    -   pause file writes to the desired volume for enough time to take a snapshot, your snapshot will be complete
    -   if you can't pause file writes, you need to un-mount (detach) the volume from the EC2 instance, take the snapshot, and then re-mount the volume to ensure a consistent complete snapshot
        -   you can re-mount the volume while the snapshot status is pending (being processed)
            -   this means the volume does not have to be detached until the snapshot completes
-   to create a snaphost for **a root (boot) EBS volumes**, you should stop the instance first then take the snapshot
    -   be careful if you have any instance-store volumes on the EC2 instance, their data will be lost once you stop the instance

## Incremental snapshots

-   EBS snapshots are stored incrementally

    -   for low cost storage on S3, and a guarantee to be able to fully restore data from the snapshot
        -   what you need is a single snapshot, then further snapshots sill only carry the changed blocks (incremental updates)
            -   therefore, you do not need to have multiple fill/complete copies of the snapshot (less storage, faster updates)

-   EBS snapshots are **asynchronously** created
    -   this refers to the fact that updates or changes to snapshots do not have to happen immediately when the repspective volume data changes
-   you are charged for
    -   data transferred to S3 from your EBS volume you are taking snapshot of
    -   storage on S3

# encryption

-   EBS Encryption is supported on **all EBS volume types**, and all EC2 instance families
-   snapshots of encrypted volumes are also encrypted
-   creating an EBS volume from an encrypted snapshot will result in an encrypted volume

-   there is no direct way to change the encryption state of a volume
-   to change the state (indirectly) you need to follow either of the following ways:
    1.  Attach a new, encrypted, EBS volume to the EC2 instance that has the data to be encrypted then,
        -   mount the new volume to the EC2 instance
        -   copy the data from the un-encrypted volume to the new volume
        -   both volumes MUST be on the same EC2 instance
    2.  create a snapshot of the un-encrypted volume
        -   copy the snapshot and choose encryption for the new copy, this will create an encrypted copy of the snapshot
        -   use this new copy to create an EBS volume, which will be encrypted too
        -   attach the new, encrypted, EBS volume to the EC2 instance
        -   you can delete the one with the un-encrypted data

## encryption at rest

-   data encryption at rest means, encrypting data while it is stored on the data storage device
-   there are many ways you can encrypt data on an EBS volume at rest, while the volume is attached to an EC2 instance
    -   use 3rd party EBS volume (SSD or HDD) encryption tools
    -   use encrypted EBS volumes
    -   use encryption at the OS level (using data encryption plugins/drivers)
    -   encrypt data at the application level before storing it to the volume
    -   use encrypted file system on top of the EBS volumes

## encryption in transit

-   remember that the EBS volumes are not physically attached to the EC2 instance, rather, they are virtually attached through the AWS infrastructure

    -   this means when you encrypt data on an EBS volume, data is actually encrypted on the EC2 instance then transferred, encrypted, to be stored on the EBS volume
        -   this means data in transit between EC2 and encrypted EBS volume is also encrypted

-   data at rest in the EBS volume is also encrypted

## root volume encryption

-   there is no direct way to change the encryption state of volume
-   there is an indirect workaround to this
    -   launch the instance with the EBS volumes required
    -   do whatever patching or install applications
    -   create an AMI from the EC2 instance
    -   copy the AMI and choose encryption while copying
    -   this results in an encrypted AMI that is private (yours only)
    -   use the encrypted AMI to launch new EC2 instances which will have their EBS root volumes encrypted

## encryption keys

-   to encrypt a volume or a snapshot, you need an encryption key, these keys are called customer master keys (CMKs) and are managed by AWS key management system (KMS)

-   when encrypting the first EBS volume, AWS KMS creates a **default CMK key**

    -   this keys is used for your first volume encryption, encryption of snapshots created from this volumes, and subsequent volumes created from these snapshots

-   after that, each newly encrypted volume is encrypted with a unique/separate AES256 bits encryption key

    -   this key is used to encrypt the volume, its snapshots, and any volumes created from these snapshots

-   you can **NOT** change the encryption (CMK) key used to encrypt an existing encrypted snapshots or encrypted EBS volumes
    -   if you want to change the key, create a copy of the snapshot, and specify, during the copy process, that you want to re-encrypt the copy with a different key
        -   this comes in handy when you have a snapshot that was encrypted using your default CMK key, and you want to change the key in order to be able to share the snapshot with other accounts

## volume migration

-   **EBS volumes are AZ specific** (can be used in the AZ where they are created only)

    -   to move/migrate **your EBS volume to another AZ** in the same region
        -   create a snapshot of the volume
        -   use the snapshot to create a new volume in the new AZ
    -   to move/migrate **your EBS volume to another region**
        -   you need to create a snapshot of the volume
        -   copy the snapshot and specify the new region where it shoule be
        -   in the new region, create a volume out of the copied snapshot

-   **snapshots on the other hand are region specific**, they can be used in any AZ in the same region where the snapshot is

## sharing EBS snapshots

-   by default, only the account owner can create volumes from the account snapshots
-   you can share your **unencrypted** snapshots with the AWS community by making them **public** (modifying the snapshot permissions to public)
-   also, you can share your unencrypted snapshots with a selected AWS accoounts, by **making them private** then select the AWS accounts to share with
-   you **can NOT** make your encrypted snapshots public
-   you **can NOT** make a snapshot of an encrypted EBS volume public on AWS

    -   however, you can share it with other AWS accounts if needed, but you need to mark it _private_ then share it

-   you can share your encrypted snapshots with specific AWS accounts as follows

    -   make sure that you use a non-default/custom CMK key to encrypt the snapshot, not the default DMK key (**AWS will not allow the sharing if the default CMK is used**)
    -   configure **cross-account permissions**, in order to give the accounts with which you want to share the snapshot, access to the custom CMK key used to encrypt the snapshot
        -   without this, the other accounts will not be able to copy the snapshot, nor will be able to create volumes of the snapshot
    -   _mark the snapshot private_, then enter the AWS accounts with which you want to share the snapshot

-   AWS will not allow you to share snapshots encrypted using your default CMK key
-   for the AWS accounts with whom an encrypted snapshot is shared

    -   they **must first create their own copies of the snapshot**
        -   then they use that copy to restore/create EBS volumes
    -   [recommended] they can also choose to re-encrypt the shared, encrypted, snapshot during the copy process using one of their CMK keys to have fill control over their copy of the shared snapshot

-   when you share your snapshot of a volume, you are actually sharing all the data on that volume used to create the snapshot
-   changes made by other accounts to their copies, do not impact the original shared snapshots

## copying the snapshot

-   the following is possible for your own snapshots
    -   you can copy an un-encrypted snapshot
        -   during the process, you can request encryption for the resulting copy
    -   you can also copy an encrypted snapshot
        -   during the copy process, you can request to re-encrypt it using a different key
-   snapshots copies receive a new snapshot ID, different from that of the original snapshot

-   you can copy a snapshot within the same region, or from one region to another
-   to move a snapshot to another region, you need to copy it to that region
-   you can only make a copy of the snapshot when it has been fully saved to S3 (its status shows as _complete_), and not during the snapshot's _pending_ status (when data block are being moved to S3)
-   S3's server side encryption (SSE) protects the snapshot data in-transit while copying (since the snapshot and the copy are both on S3)

-   user defined tags **are NOT** copied from the oiginal snapshot to the copy
-   you can have up to 5 snapshots copy requests running in a single desitnation per account
-   you can copy import/export service, AWS marketplace, and AWS storage gateway snapshots (not just the EBS ones)
-   if you try to copy an encrypted snapshot without having permissions to the encryption key, the copy process will _fail silently_
    -   this is why _cross-account permissions_ were required when sharing encrypted snapshots
        -   if the accounts with whichc the snapshot is shared, do not have access to the encryption key, they will not be able to create copies nor will be able to use the shared snapshot
